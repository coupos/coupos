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
    from_str = event['queryStringParameters']['from']
    to_str = event['queryStringParameters']['to']

    try:
        datetime.strptime(from_str, '%Y-%m-%d %H:%M:%S')
        datetime.strptime(to_str, '%Y-%m-%d %H:%M:%S')
    except ValueError:
        return response(400, {}, {'message': 'request query error.'})

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
        #アイテム一覧取得
        cur.execute('SELECT items FROM sales WHERE userid = %s AND saled_at BETWEEN %s AND %s', (userid, from_str, to_str))
        item_log = [json.loads(sale['items']) for sale in cur.fetchall()]
        print(item_log)

        itemobj_list = []
        sale_items = {}
        for items in item_log:
            for item in items.values():
                itemobj = {'id': item['id'], 'name': item['name'], 'price': item['price']}
                if not(itemobj in itemobj_list):
                    # 新規登録
                    itemobj_list.append(itemobj)
                    
                index = itemobj_list.index(itemobj)                        
                sale_items[index] = sale_items.get(index,0) + item['num']

        items = []
        for item in sale_items.items():
            items.append({
                'obj': itemobj_list[item[0]],
                'num': item[1],
                'earnings': item[1] * itemobj_list[item[0]]['price']
            })
    
    return response(200, {'Access-Control-Allow-Origin': '*'}, items)