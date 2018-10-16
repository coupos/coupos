import pymysql.cursors
from datetime import datetime, timedelta
import boto3
import json
from statistics import stdev

import rds_config

def make_heatmap_log(user,
              sale_num = 0,
              working_rate = 0,
              confusion_rate = 0,
              change_rate = 0,
              change_status = 'closed',
              update_time = datetime.now(),
              prev_data = None):

    # DBに格納する、数値情報が入ったデータ。
    
    return {
        'user': user,
        'sale_num': sale_num,
        'working_rate': working_rate,
        'confusion_rate': confusion_rate,
        'change_rate': change_rate,
        'change_status': change_status,
        'updated_at': update_time,
        'prev_data': prev_data
    }


def make_booth_info(name = 'undefined',
                    description = None,
                    coord = {'map': -1, 'x': 0, 'y': 0},
                    color = '#ffffff',
                    ratio = 0,
                    icon_url = None):

    # APIのレスポンスに使う、利用しやすいデータ

    return {
        'name': name,
        'description': description,
        'coord': coord,
        'color': color,
        'ratio': ratio,
        'icon': icon_url
    }


def response(status_code, header, body):
    return {
        "statusCode": status_code,
        "headers": header,
        "body": json.dumps(body)
    }

    

def lambda_handler(event, context):
    # バリデーション

    if event['pathParameters'] is None:
        return response(400, {}, {'message': 'Bad request.'})

    eventuser = event['pathParameters']['id']

    # rds setting
    host = rds_config.db_host
    username = rds_config.db_username
    password = rds_config.db_password
    dbname = rds_config.db_name

    # rds connect
    try:
        connection = pymysql.connect(host = host,
                                     user = username,
                                     password = password,
                                     db = dbname,
                                     cursorclass = pymysql.cursors.DictCursor)
    except:
        return response(500, {}, {"message": "Server connection error."})

    # 測定時間間隔(分)
    section_range = 30

    # 基準時間の算出
    # まずは日本時間になおしてから
    new_time = datetime.now() + timedelta(hours = 9)
    new_time_str = new_time.strftime('%Y-%m-%d %H:%M:%S')
    old_time = new_time - timedelta(minutes = section_range)
    old_time_str = old_time.strftime('%Y-%m-%d %H:%M:%S')

    booths = []
    maps = []

    with connection.cursor() as cur:
        # eventに紐づくuserの取得
        cur.execute('SELECT regiusers FROM event_users WHERE userid = %s', eventuser)
        data = cur.fetchall()
        users = []
        if len(data) == 0:
            return response(404, {}, {'message': 'Event not found.'})
        else:
            users = json.loads(data[0]['regiusers'])

        # 各ユーザーについて、同様の処理を行う
        for user in users:

            cur.execute('SELECT name FROM staffs WHERE userid = %s', user)
            staffs = [data['name'] for data in cur.fetchall()]

            # 前回の混雑度の取得
            cur.execute('SELECT * FROM heatmap_log WHERE userid = %s', user)
            ## もしかしたら、アナライズAPIの結果もここに入れることになるかも。
            ## そうすると、try以外にも、NULLでキャッチしないといけなくなりそう…？
            data = cur.fetchall()
            if len(data) != 0:
                prev_heatmap_log = data[0]
                if prev_heatmap_log['updated_at'] + timedelta(minutes = 5) >= datetime.now():
                    # 最終更新から5分経っていない→前回の値を返す
                    booths.append(json.loads(prev_heatmap_log['prev_data']))
                    continue
                
            else:
                # データがなかった→初期生成
                prev_heatmap_log = make_heatmap_log(user)

            # 店舗情報の取得
            cur.execute('SELECT name, description FROM regi_users WHERE userid = %s', user)
            data = cur.fetchall()
            name = None
            description = None
            if len(data) == 0:
                return response(404, {}, {'message': 'User not found.'})
            else:
                name, description = data[0]['name'], data[0]['description']

            # 売上ログから、該当時間帯のログを作成
            work_time = 0
            cur.execute('SELECT * FROM sales WHERE userid = %s AND saled_at BETWEEN %s AND %s', (user, old_time_str, new_time_str))
            sale_log = cur.fetchall()

            for staff in staffs:
                # スタッフの稼働時間の取得
                cur.execute('SELECT * FROM staff_activity_log WHERE userid = %s AND name = %s AND updated_at BETWEEN %s AND %s', (user, staff, old_time_str, new_time_str))            
                activity_log = cur.fetchall()

                waiting_times = []
                work_time_start = old_time
                waiting_time_start = old_time
                for activity in activity_log:
                    if activity['state_from'] == 'offline':
                        # offlineから？？になった→online
                        work_time_start = activity['updated_at']
                    elif activity['state_to'] == 'offline':
                        # ？？からofflineになった→offline
                        work_time_delta = activity['updated_at'] - work_time_start
                        work_time += work_time_delta.total_seconds() // 60

                    if activity['state_to'] == 'waiting':
                        waiting_time_start = activity['updated_at']
                    elif activity['state_from'] == 'waiting' and activity['state_to'] == 'typing':
                        waiting_time_delta = activity['updated_at'] - waiting_time_start
                        waiting_times.append(waiting_time_delta.total_seconds())

                # 待機時間の標準偏差
                ## まだ使用予定はないが、今後使っていきたい
                waiting_stdev = 0
                if len(waiting_times) > 1:
                    waiting_stdev = stdev(waiting_times)

            # 売上回数
            sale_num = len(sale_log)

            # 稼働率の算出
            # 
            working_rate = work_time / section_range

            change_rate = None
            color = None
            if working_rate == 0:
                # まったく稼働していない
                # 状態は準備中。
                change_status = 'closed'
                color = '#c8c8c8' # gray

                # 前回の状態が稼働状態なら、その混雑度をそのまま反映。(短時間準備中かもしれないから。)
                # 未稼働状態なら、完全な店じまい状態(混雑度=0)とする。
                if prev_heatmap_log['change_status']  == 'closed':
                    confusion_rate = 0
                    change_rate = 0
                else:
                    confusion_rate = prev_heatmap_log['confusion_rate']
                    change_rate = 1
                
            elif working_rate <= 0.3:
                # ほとんど稼働していない
                # 販売中だけど、ほとんど稼働していないということを伝えたい
                # 混雑度は通常通りに計算するけど、状態は準備中とする。
                confusion_rate = sale_num / working_rate
                change_rate = 0
                if prev_heatmap_log['confusion_rate'] != 0:
                    change_rate = confusion_rate / prev_heatmap_log['confusion_rate']
                elif sale_num == 0:
                    change_rate = 0
                else:
                    # 混雑度無限大
                    change_rate = 999            
                change_status = 'closed'
                color = '#c8c8c8' # gray
            
            else:
                # 稼働している

                # 混雑度の算出
                # 混雑度 = 売上回数 / 稼働率
                # 稼働率300%で9回の売り上げと、稼働率100%で3回の売り上げの混雑度は等しい。
                confusion_rate = sale_num / working_rate

                # 混雑指標の算出
                change_rate = 0
                if prev_heatmap_log['confusion_rate'] != 0:
                    change_rate = confusion_rate / prev_heatmap_log['confusion_rate']
                elif sale_num == 0:
                    # 前回も今回も混雑度は0
                    change_rate = 1
                else:
                    # 混雑度無限大
                    change_rate = 999

                if change_rate < 0.7:
                    change_status = 'decrease'
                    color = '#005ebb' # blue
                elif 1.5 < change_rate:
                    change_status = 'quick_inclease'
                    color = '#ee2b2b' #red
                elif 1.2 < change_rate <= 1.5:
                    change_status = 'inclease'
                    color = '#faa20e' # yellow or orange
                else:
                    change_status = 'flat'
                    color = '#07d34f' # green

            # マップ情報をとってくる
            ## 現状、未完成のため、適当な座標を突っ込む
            ## 予定：
            ## cur.execute('SELECT (x, y) FROM maps WHERE user_id = {}'.format(user_id))

            map_pos = 0
            map_x = 123
            map_y = 456

            booth_info = make_booth_info(name,
                                     description,
                                     {'map': map_pos, 'x': map_x, 'y': map_y},
                                     color,
                                     sale_num,
                                     None)
                                     
            hm_log = make_heatmap_log(user,
                                      sale_num, 
                                      working_rate,
                                      confusion_rate,
                                      change_rate,
                                      change_status,
                                      datetime.now(),
                                      json.dumps(booth_info))

            # DBにデータを反映させる
            cur.execute('INSERT INTO heatmap_log(userid, sale_num, working_rate, confusion_rate, change_rate, change_status, updated_at, prev_data) \
                         VALUES (%(user)s, %(sale_num)s, %(working_rate)s, %(confusion_rate)s, %(change_rate)s, %(change_status)s, %(updated_at)s, %(prev_data)s) \
                         ON DUPLICATE KEY UPDATE sale_num = %(sale_num)s, working_rate = %(working_rate)s, confusion_rate = %(confusion_rate)s, \
                         change_rate = %(change_rate)s, change_status = %(change_status)s, updated_at = %(updated_at)s, prev_data = %(prev_data)s', hm_log)
            connection.commit()

            booths.append(booth_info)
        
        ## mapsがあるなら、このタイミングで取ってくる
        ## どうSQLを叩くのか、全くわからない
        maps = []

    return response(200, {'Access-Control-Allow-Origin': '*'}, {'booths': booths, 'maps': maps})