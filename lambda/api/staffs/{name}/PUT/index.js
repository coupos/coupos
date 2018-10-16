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
  if (!event.pathParameters || !event.pathParameters.name) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"name" is not defined' })
    callback(null, response)
    return
  } else {
    event.pathParameters.name = decodeURI(event.pathParameters.name)
  }

  if (!request.state) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"state" is not defined' })
    callback(null, response)
    return
  }
  if (typeof request.state !== 'string') {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"state" should be string' })
    callback(null, response)
    return
  }
  if (['offline', 'waiting', 'typing', 'closed'].indexOf(request.state) < 0) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"state" should be "offline", "waiting", "typing", or "closed"' })
    callback(null, response)
    return
  }

  let values = [ event.pathParameters.name, event.requestContext.authorizer.claims.sub ]

  conn.query('SELECT `state` FROM `staffs` WHERE `name` = ? AND `userid` = ?', values, (error, result, fields) => {
    if (error) {
      console.log(error)
      conn.destroy()
      callback(error)
      throw error
    }
    
    let beforeState = result[0].state
    
    values = [ request.state, event.pathParameters.name, event.requestContext.authorizer.claims.sub ]
    
    conn.query('UPDATE `staffs` SET `state` = ? WHERE `name` = ? AND `userid` = ?', values, (error, result, fields) => {
      if (error) {
        console.log(error)
        conn.destroy()
        callback(error)
        throw error
      }
      
      values = [ event.requestContext.authorizer.claims.sub, event.pathParameters.name, beforeState, request.state ]
      
      conn.query('INSERT INTO `staff_activity_log` (`userid`, `name`, `state_from`, `state_to`) VALUES (?, ?, ?, ?)', values, (error, result, fields) => {
        if (error) {
          console.log(error)
          conn.destroy()
          callback(error)
          throw error
        }
        
        console.log('Success')
          
        let resBody = {}
        
        if (result.affectedRows > 0) {
          resBody = {}
        } else {
          response.statusCode = 404
          resBody = { message: 'The staff ' + event.pathParameters.name + ' is not found' }
        }
        
        response.body = JSON.stringify(resBody)
        
        conn.end()
        callback(null, response)
      })
    })
  })
}
