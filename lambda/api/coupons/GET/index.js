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

  // MySQLデータベースでSQL実行
  conn.query('SELECT * FROM `coupons` WHERE `userid` = ?', event.requestContext.authorizer.claims.sub, (error, result, fields) => {
    if (error) {
      console.log(error)
      conn.destroy()
      callback(error)
    }

    let resBody = {}

    result.forEach(row => {
      resBody[row.id] = {
        type: row.type,
        left_times: row.left_times,
        expire_time: row.expire_time,
        provided: row.provided,
        created_at: row.created_at
      }
    })

    console.log('Success')
    response.body = JSON.stringify(resBody)

    conn.end()
    callback(null, response)
  })
}
