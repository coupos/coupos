var mysql = require('mysql')

exports.handler = (event, context, callback) => {
  let conn = mysql.createConnection({
    host     : process.env.MYSQL_HOST,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DBNAME
  })

  let response = {
    statusCode: 200,
    headers: {},
    body: undefined
  }
  response.headers['Access-Control-Allow-Origin'] = '*'

  if (!event.requestContext || !event.requestContext.authorizer.claims.sub) {
    response.statusCode = 401
    response.body = JSON.stringify({ message: 'Unauthorized' })
    callback(null, response)
    return
  }
  
  if (!event.queryStringParameters || !event.queryStringParameters.from) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"from" is not defined' })
    callback(null, response)
    return
  } else if (typeof event.queryStringParameters.from !== 'string') {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"from" should be string' })
    callback(null, response)
    return
  } else if (event.queryStringParameters.from.length !== 19) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: 'The length of "from" should be 19' })
    callback(null, response)
    return
  }

  if (!event.queryStringParameters.to) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"to" is not defined' })
    callback(null, response)
    return
  } else if (typeof event.queryStringParameters.to !== 'string') {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"to" should be string' })
    callback(null, response)
    return
  } else if (event.queryStringParameters.to.length !== 19) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: 'The length of "to" should be 19' })
    callback(null, response)
    return
  }

  // MySQLデータベースでSQL実行
  conn.query('SELECT * FROM `sales` WHERE `userid` = ? AND `saled_at` BETWEEN ? AND ?', [event.requestContext.authorizer.claims.sub, event.queryStringParameters.from, event.queryStringParameters.to], (error, result, fields) => {
    if (error) {
      console.log(error)
      conn.destroy()
      callback(error)
    }

    let resBody = []

    result.forEach(row => {
      resBody.push({
        id: row.id,
        items: JSON.parse(row.items),
        coupons: JSON.parse(row.coupons),
        total_val: row.total_val,
        payment_val: row.payment_val,
        change_val: row.change_val,
        saled_at: row.saled_at,
        saled_by: row.saled_by
      })
    })

    console.log('Success')
    response.body = JSON.stringify(resBody)

    conn.end()
    callback(null, response)
  })
}
