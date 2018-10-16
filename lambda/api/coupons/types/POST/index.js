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
  
  if (!request.name) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"name" is not defined' })
    callback(null, response)
    return
  }
  if (typeof request.name !== 'string') {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"name" should be string' })
    callback(null, response)
    return
  }
  if (request.name.length <= 0) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: 'The length of "name" should be more than 0' })
    callback(null, response)
    return
  }
  if (request.name.length > 30) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: 'The length of "name" should be no more than 30' })
    callback(null, response)
    return
  }

  if (!request.value) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"value" is not defined' })
    callback(null, response)
    return
  }
  if (isNaN(request.value)) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"value" should be number' })
    callback(null, response)
    return
  }

  if (!request.unit) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"unit" is not defined' })
    callback(null, response)
    return
  }
  if (typeof request.unit !== 'string') {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"unit" should be string' })
    callback(null, response)
    return
  }
  if (['yen', 'per'].indexOf(request.unit) < 0) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"unit" should be "yen" or "per"' })
    callback(null, response)
    return
  }

  if (!request.target || !Array.isArray(request.target)) {
    request.target = null
  }

  if (!request.limit_times || isNaN(request.limit_times)) {
    request.limit_times = null
  }

  if (!request.concurrent || isNaN(request.concurrent)) {
    request.concurrent = 1
  }

  if (!request.default_expire_time || typeof request.default_expire_time !== 'string') {
    request.default_expire_time = null
  }

  let values = [ event.requestContext.authorizer.claims.sub, request.name, request.value, request.unit, request.target ? JSON.stringify(request.target) : null, request.limit_times, request.concurrent, request.default_expire_time ]

  conn.query('INSERT INTO `coupon_types` (`userid`, `name`, `value`, `unit`, `target`, `limit_times`, `concurrent`, `default_expire_time`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', values, (error, result, fields) => {
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
