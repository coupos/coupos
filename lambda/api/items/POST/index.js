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
  
  request.id = uniqid('i')

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
    response.body = JSON.stringify({ message: 'The length of "name" is 0' })
    callback(null, response)
    return
  }
  if (request.name.length > 30) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: 'The length of "name" should be no more than 30' })
    callback(null, response)
    return
  }

  if (!request.category || typeof request.category !== 'string' || request.category.length <= 0) {
    request.category = null
  } else if (request.category.length > 20) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: 'The length of "category" should be no more than 30' })
    callback(null, response)
    return
  }

  if (request.price === undefined || request.price === null) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"price" is not defined' })
    callback(null, response)
    return
  }
  if (isNaN(request.price)) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"price" should be number' })
    callback(null, response)
    return
  }
  if (request.price < 0) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"price" should be no less than 0' })
    callback(null, response)
    return
  }

  let values = [ request.id, event.requestContext.authorizer.claims.sub, request.name, request.category, request.price ]

  conn.query('INSERT INTO `items` (`id`, `userid`, `name`, `category`, `price`) VALUES (?, ?, ?, ?, ?)', values, (error, result, fields) => {
    if (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        conn.destroy()

        response.statusCode = 409
        response.body = JSON.stringify({ message: '"id" is conflicted' })
        callback(null, response)
      } else {
        console.log(error)
        conn.destroy()
        callback(error)
      }
    } else {
      console.log('Success')
      let resBody = {}
      response.body = JSON.stringify(resBody)

      conn.end()
      callback(null, response)
    }
  })
}
