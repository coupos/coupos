var mysql = require('mysql')
const userPoolId = 'us-east-1_3vlAXHPCC'

exports.handler = (event, context, callback) => {
  let conn = mysql.createConnection({
    host     : process.env.MYSQL_HOST,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DBNAME
  })

  if (event.userPoolId !== userPoolId) {
    callback(null, event)
    return
  }

  if (event.triggerSource === 'PostConfirmation_ConfirmSignUp') {
    conn.query('SELECT * FROM `regi_users` WHERE `userid` = ?', event.request.userAttributes.sub, (error, result, fields) => {
      if (error) {
        console.log(error)
        conn.destroy()
        callback(error)
      }

      if (result.length > 0) {
        console.log(event.request.userAttributes.sub + ' already exists')
        
        conn.end()
        callback(null, event)
        return
      }
      
      console.log(event.request.userAttributes.sub + ' is not found')
      conn.query('INSERT INTO `regi_users` (`userid`) VALUES (?)', [ event.request.userAttributes.sub ], (error, result, fields) => {
        if (error) {
          console.log(error)
          conn.destroy()
          callback(error)
        }
        console.log('inserted')
        
        conn.end()
        callback(null, event)
        return
      })
    })
  }
  else {
    callback(null, event)
    return
  }
}
