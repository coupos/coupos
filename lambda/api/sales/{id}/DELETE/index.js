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

  if (!event.pathParameters || !event.pathParameters.id) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"id" is not defined' })
    callback(null, response)
    return
  }
  
  if (!event.requestContext || !event.requestContext.authorizer.claims.sub) {
    response.statusCode = 401
    response.body = JSON.stringify({ message: 'Unauthorized' })
    callback(null, response)
    return
  }

  conn.query('DELETE FROM `sales` WHERE `id` = ? AND `userid` = ?', [event.pathParameters.id, event.requestContext.authorizer.claims.sub], (error, result, fields) => {
    if (error) {
      console.log(error)
      conn.destroy()
      callback(error)
    }

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
  })
}
