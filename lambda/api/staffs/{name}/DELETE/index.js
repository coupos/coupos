var mysql = require('mysql')

exports.handler = (event, context, callback) => {
  let conn = mysql.createConnection({
    host     : process.env.MYSQL_HOST,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DBNAME
  })

  let response = {
    statusCode: 204,
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
  
  if (!event.pathParameters || !event.pathParameters.name) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"name" is not defined' })
    callback(null, response)
    return
  } else {
    event.pathParameters.name = decodeURI(event.pathParameters.name)
  }

  conn.query('DELETE FROM `staffs` WHERE `name` = ? AND `userid` = ?', [event.pathParameters.name, event.requestContext.authorizer.claims.sub], (error, result, fields) => {
    if (error) {
      console.log(error)
      conn.destroy()
      callback(error)
    } else {
      let resBody = {}

      if (result.affectedRows > 0) {
        resBody = {}
      } else {
        response.statusCode = 404
        resBody = {}
      }

      console.log('Success')
      response.body = JSON.stringify(resBody)

      conn.end()
      callback(null, response)
    }
  })
}
