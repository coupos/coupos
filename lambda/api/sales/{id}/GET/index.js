var mysql = require('mysql')

exports.handler = (event, context, callback) => {
  let conn = mysql.createConnection({
    host     : process.env.MYSQL_HOST,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DBNAME
  })

  conn.query('SELECT * FROM `sales` WHERE `id` = ?', event.pathParameters.id, (error, result, fields) => {
    let response = {
      statusCode: 200,
      headers: {},
      body: undefined
    }

    if (error) {
      console.log(error)
      conn.destroy()
      callback(error)
    }

    let resBody = {}

    if (result.length !== 0) {
      resBody = {
        items: JSON.parse(result[0].items),
        coupons: JSON.parse(result[0].coupons),
        total_val: result[0].total_val,
        payment_val: result[0].payment_val,
        change_val: result[0].change_val,
        saled_at: result[0].saled_at,
        saled_by: result[0].saled_by
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
