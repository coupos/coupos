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

  if (!event.requestContext || !event.requestContext.authorizer.claims.sub) {
    response.statusCode = 401
    response.body = JSON.stringify({ message: 'Unauthorized' })
    callback(null, response)
    return
  }

  if (request.name === undefined || request.name === null) {
    request.name = null
  } else if (typeof request.name !== 'string') {
    request.name = null
  } else if (request.name.length === 0) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: 'The length of "name" is 0' })
    callback(null, response)
    return
  } else if (request.name.length > 50) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: 'The length of "name" should be no more than 50' })
    callback(null, response)
    return
  }

  if (request.description === undefined || request.description === null) {
    request.description = null
  } else if (typeof request.name !== 'string') {
    request.description = null
  } else if (request.name.length === 0) {
    request.description = ''
  } else if (request.name.length > 100) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: 'The length of "name" should be no more than 100' })
    callback(null, response)
    return
  }

  if (request.forceChangePassword === undefined || request.forceChangePassword === null) {
    request.forceChangePassword = null
  }
  
  let sql = 'UPDATE `regi_users` SET '
  let values = []
  if (request.name !== null) {
    sql += '`name` = ? '
    values.push(request.name)
  }
  if (request.description !== null) {
    if (request.name !== null) sql += ', `description` = ? '
    else sql += '`description` = ? '
    
    values.push(request.description)
  }
  if (request.forceChangePassword !== null) {
    if (request.name !== null || request.description !== null) sql += ', `force_change_password` = ? '
    else sql += '`force_change_password` = ? '
    
    values.push(request.forceChangePassword)
  }
  sql += 'WHERE `userid` = ?'
  values.push(event.requestContext.authorizer.claims.sub)

  console.log(sql + ', ' + JSON.stringify(values))

  conn.query(sql, values, (error, result, fields) => {
    if (error) {
      console.log(error)
      conn.destroy()
      callback(error)
    }

    let resBody = {}

    console.log('Success')
    response.body = JSON.stringify(resBody)

    conn.end()
    callback(null, response)
  })
}
