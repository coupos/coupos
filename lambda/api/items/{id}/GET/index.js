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
  
  if (!event.requestContext || !event.requestContext.authorizer.claims.sub) {
    response.statusCode = 401
    response.body = JSON.stringify({ message: 'Unauthorized' })
    callback(null, response)
    return
  }

  conn.query('SELECT * FROM `items` WHERE `id` = ? AND `userid` = ?', [event.pathParameters.id, event.requestContext.authorizer.claims.sub], async (error, result, fields) => {
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

    resBody = {
      name: result[0].name,
      price: result[0].price
    }
    
    if (result[0].category !== null) {
      await getCategory(result[0].category)
        .then(category => {
          console.log('Push : ' + result)
          resBody.category = {
            id: result[0].category,
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
      resBody[result[0].id].category = null
    }
    
    if (result.length !== 0) {
      resBody = {
        name: result[0].name,
        category: result[0].category,
        price: result[0].price
      }
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
