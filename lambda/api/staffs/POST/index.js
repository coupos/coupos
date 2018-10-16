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
  
  if (!event.requestContext || !event.requestContext.authorizer.claims.sub) {
    response.statusCode = 401
    response.body = JSON.stringify({ message: 'Unauthorized' })
    callback(null, response)
    return
  }

  /* バリデーション */
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

  let values = [ event.requestContext.authorizer.claims.sub, request.name ]

  conn.query('INSERT INTO `staffs` (`userid`, `name`, `state`) VALUES (?, ?, "offline")', values, (error, result, fields) => {
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
