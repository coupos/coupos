import pymysql.cursors
from datetime import datetime, timedelta
import boto3
import json

import rds_config

def lambda_handler(event, context):

    # バリデーション
    require_keys = ['userid', 'date']

    require = []
    for require_key in require_keys:
        if not (require_key in event.keys()):
            require.append(require_key)

    if len(require) != 0:
        s = 'が足りません。　このパラメーターは必須項目です。'
        for req in require:
            s = req + ' ' + s
        raise Exception('request error. ' + s)

    try:
        datetime.strptime(event['date'], '%Y-%m-%d')
    except ValueError:
        raise ValueError('request error. dateは次の形式で入力してください 「YYYY-MM-DD」')


    

    host = rds_config.db_host
    username = rds_config.db_username
    password = rds_config.db_password
    dbname = rds_config.db_name

    try:
        connection = pymysql.connect(host = host,
                                     user = username,
                                     password = password,
                                     db = dbname,
                                     cursorclass = pymysql.cursors.DictCursor)
    except:
        raise Exception('connect error.')

    with connection.cursor() as cur:
        analyse_log = []

        # APIのアドレスからuseridをとってくる
        userid = event['userid']

        # 時間の取得
        # 本来は、リクエストボディにある日付データを受け取る
        time_str = event['date']

        # 1時間ごとの売上ログの取得
        for hour in range(24):
            cur.execute('SELECT * FROM sales WHERE userid = %s AND saled_at BETWEEN %s AND %s',
                        (userid, time_str + ' {:02}:00:00'.format(hour), time_str + ' {:02}:59:59'.format(hour)))
            sale_log = cur.fetchall()
            items_log = [json.loads(sale['items']) for sale in sale_log]
            ## ここでアイテムの総販売量を調べる
            sale_items = {}
            for items in items_log:
                for itemid in items.keys():
                    sale_items[itemid] = sale_items.get(itemid,0) + items[itemid]

            sale_count = len(sale_log)
            earnings = 0
            for sale in sale_log:
                earnings += sale['total_val']

            dic = {
                'date': time_str + ' {:02}:00:00'.format(hour),
                'sale_count': sale_count,
                'earnings': earnings,
                'sale_items': sale_items
            }
            analyse_log.append(dic)
    
    return analyse_log
        
