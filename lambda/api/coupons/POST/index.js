var mysql = require('mysql')
var uniqid = require('locutus/php/misc/uniqid')

exports.handler = (event, context, callback) => {
  let conn = mysql.createConnection({
    host     : process.env.MYSQL_HOST,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DBNAME
  })

  let request = JSON.parse(event.body)
  let response = {
    statusCode: 201,
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

  let id = uniqid('c')

  let values = [ id, event.requestContext.authorizer.claims.sub, request.type, request.left_times, request.expire_time ]

  conn.query('INSERT INTO `coupons` (`id`, `userid`, `type`, `left_times`, `expire_time`) VALUES (?, ?, ?, ?, ?)', values, (error, result, fields) => {
    if (error) {
      console.log(error)
      conn.destroy()
      callback(error)
    } else {
      console.log('Success')
      let resBody = { id }
      response.body = JSON.stringify(resBody)

      conn.end()
      callback(null, response)
    }
  })
}
