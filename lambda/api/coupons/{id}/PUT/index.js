var mysql = require('mysql')

exports.handler = (event, context, callback) => {
  let conn = mysql.createConnection({
    host     : process.env.MYSQL_HOST,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DBNAME
  })

  let request = JSON.parse(event.body)
  let response = {
    statusCode: 200,
    headers: {},
    body: undefined
  }
  response.headers['Access-Control-Allow-Origin'] = '*'

  /* バリデーション */
  if (!event.requestContext || !event.requestContext.authorizer.claims.sub) {
    response.statusCode = 401
    response.body = JSON.stringify({ message: 'Unauthorized' })
    callback(null, response)
    return
  }
  
  if (!event.pathParameters || !event.pathParameters.id) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"id" is not defined' })
    callback(null, response)
    return
  }

  if (!request.type) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"type" is not defined' })
    callback(null, response)
    return
  }
  if (isNaN(request.type)) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"type" should be number' })
    callback(null, response)
    return
  }

  if (!request.left_times || isNaN(request.left_times)) {
    request.left_times = null
  }

  if (!request.expire_time || typeof request.expire_time !== 'string') {
    request.expire_time = null
  }

  if (!request.provided || typeof request.provided !== 'boolean') {
    request.provided = false
  }

  let values = [ request.type, request.left_times, request.expire_time, request.provided, event.pathParameters.id, event.requestContext.authorizer.claims.sub ]

  conn.query('UPDATE `coupons` `type` = ?, `left_times` = ?, `expire_time` = ?, `provided` = ? WHERE `id` = ? AND `userid` = ?', values, (error, result, fields) => {
    if (error) {
      console.log(error)
      conn.destroy()
      callback(error)
    } else {
      console.log('Success')
      let resBody = {}
      response.body = JSON.stringify(resBody)

      conn.end()
      callback(null, response)
    }
  })
}
