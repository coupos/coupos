var mysql = require('mysql')

exports.handler = (event, context, callback) => {
  let conn = mysql.createConnection({
    host     : process.env.MYSQL_HOST,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DBNAME
  })

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

  // MySQLデータベースでSQL実行
  conn.query('SELECT * FROM `items` WHERE `userid` = ?', event.requestContext.authorizer.claims.sub, async (error, result, fields) => {
    if (error) {
      console.log(error)
      conn.destroy()
      callback(error)
    }

    let resBody = {}
    
    var getCategory = id => {
      return new Promise((resolve, reject) => {
        conn.query('SELECT * FROM `categories` WHERE `id` = ? AND `userid` = ?', [ id, event.requestContext.authorizer.claims.sub ], (error, category, fields) => {
          if (error) {
            reject(error)
          }
          
          resolve(category[0])
        })
      })
    }

    for (let i = 0; i < result.length; i++) {
      resBody[result[i].id] = {
        name: result[i].name,
        price: result[i].price
      }
      
      if (result[i].category !== null) {
        await getCategory(result[i].category)
          .then(category => {
            console.log('Push : ' + result)
            resBody[result[i].id].category = {
              id: result[i].category,
              name: category.name,
              color: category.color
            }
          })
          .catch(error => {
            response.statusCode = 500
            response.body = JSON.stringify({ message: 'Internal Server Error' })
            callback(null, response)
            throw error
          })
      } else {
        resBody[result[i].id].category = null
      }
    }

    console.log('Success')
    response.body = JSON.stringify(resBody)

    conn.end()
    callback(null, response)
  })
}
