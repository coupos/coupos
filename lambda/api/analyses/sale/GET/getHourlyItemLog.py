import pymysql.cursors
from datetime import datetime, timedelta
import boto3
import json
import logging

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
    time_str = event['queryStringParameters']['date']

    try:
        datetime.strptime(time_str, '%Y-%m-%d')
    except ValueError:
        return response(400, {}, {'message': 'request query error.'})

    # rds connect
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
        return response(500, {}, {"message": "database connection error."})

    with connection.cursor() as cur:
        analyse_log = []

        # 1時間ごとの売上ログの取得
        for hour in range(24):
            cur.execute('SELECT * FROM sales WHERE userid = %s AND saled_at BETWEEN %s AND %s',
                        (userid, time_str + ' {:02}:00:00'.format(hour), time_str + ' {:02}:59:59'.format(hour)))
            sale_log = cur.fetchall()
            items_log = [json.loads(sale['items']) for sale in sale_log]
            ## ここでアイテムの総販売量を調べる
            ## {'<itemid>: {'id': '<itemid>', ...}', '<itemid>: {'id': '<itemid>', ...}', ...}
            sale_items = {}
            itemobj_list = []
            for items in items_log:
                # {'<itemid>: {'id': '<itemid>', ...}}
                for item in items.values():
                    # {'id': '<itemid>', 'name': '<itemname>', 'price': <itemprice>, 'num': <item_sall_num>}
                    # item_listに追加
                    itemobj = {'id': item['id'], 'name': item['name'], 'price': item['price']}
                    if not(itemobj in itemobj_list):
                        # 新規登録
                        itemobj_list.append(itemobj)
                    
                    index = itemobj_list.index(itemobj)
                        
                    sale_items[index] = sale_items.get(index,0) + item['num']
                    
            '''
            {
                "obj": {
                    "id": "i12345",
                    "name": "おしるこ",
                    "price": 1000,
                },
                "num": 10
            }
            '''

            items = []
            for item in sale_items.items():
                items.append({'obj': itemobj_list[item[0]], 'num': item[1]})

            sale_count = len(sale_log)
            earnings = 0
            for sale in sale_log:
                earnings += sale['total_val']

            dic = {
                'date': time_str + ' {:02}:00:00'.format(hour),
                'count': sale_count,
                'earnings': earnings,
                'saleitems': items
            }
            print(dic)
            analyse_log.append(dic)
    
    return response(200, {'Access-Control-Allow-Origin': '*'}, analyse_log)