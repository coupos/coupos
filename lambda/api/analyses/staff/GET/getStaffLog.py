import pymysql.cursors
from datetime import datetime, timedelta
import boto3
import json

import rds_config

def response(status_code, headers, body):
    return {
        "statusCode": status_code,
        "headers": headers,
        "body": json.dumps(body)
    }

def lambda_handler(event, context):
    
    if not('authorizer' in event['requestContext'].keys()):
        return response(401, {}, {'message': 'Unauthorized.'})
    elif event['requestContext']['authorizer']['claims']['sub'] is None:
        return response(401, {}, {'message': 'Unauthorized.'})
        
    userid = event['requestContext']['authorizer']['claims']['sub']
    
    
    #rds connect
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
        return response(500, {}, {'message': 'DB connect error.'})

    with connection.cursor() as cur:
        analyse_log = []

        cur.execute('SELECT name FROM staffs WHERE userid = %s', userid)
        staffs = [data['name'] for data in cur.fetchall()]
        print(staffs)

        for staff in staffs:
            # スタッフの稼働時間の取得
            cur.execute('SELECT * FROM staff_activity_log WHERE userid = %s AND name = %s', (userid, staff))            
            activity_log = cur.fetchall()

            waiting_times = []
            work_time = 0
            work_time_start = None
            work_log = []
            for activity in activity_log:
                if activity['state_from'] == 'offline':
                    # offlineから？？になった→online
                    work_time_start = activity['updated_at']
                    work_log.append({'date': activity['updated_at'].strftime('%Y-%m-%d %H:%M:%S'), 'state': 'online'})                    
                elif activity['state_to'] == 'offline':
                    # ？？からofflineになった→offline
                    work_time_delta = activity['updated_at'] - work_time_start
                    work_time += work_time_delta.total_seconds() // 60
                    work_log.append({'date': activity['updated_at'].strftime('%Y-%m-%d %H:%M:%S'), 'state': 'offline'})
                    
            if activity_log[-1]['state_to'] != 'offline':
                # 現在online。
                work_time_delta = datetime.now() + timedelta(hours=9) - activity_log[-1]['updated_at']
                work_time += work_time_delta.total_seconds() // 60

            dic = {
                'name': staff,
                'work_time': int(work_time),
                'log': work_log
            }
            analyse_log.append(dic)


    return response(200, {'Access-Control-Allow-Origin': '*'}, analyse_log)