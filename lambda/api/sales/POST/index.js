var mysql = require('mysql2')

exports.handler = async (event, context, callback) => {
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

  console.log('A request has been received: ' + JSON.stringify(request))

  /* バリデーション */
  var isItemValuesValid = items => {
    let ret = true
    Object.keys(items).forEach(item => {
      if (isNaN(items[item]) || typeof items[item] === 'string') ret = false
    })
    return ret
  }

  if (!event.requestContext || !event.requestContext.authorizer.claims.sub) {
    response.statusCode = 401
    response.body = JSON.stringify({ message: 'Unauthorized' })
    callback(null, response)
    return
  }

  if (!request.items) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"items" is not defined' })
    callback(null, response)
    return
  }
  if (typeof request.items !== 'object') {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"items" should be object' })
    callback(null, response)
    return
  }
  if (!isItemValuesValid(request.items)) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"items" should be object of numbers' })
    callback(null, response)
    return
  }
  if (request.items.length <= 0) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"items" should have one item or more' })
    callback(null, response)
    return
  }

  if (!request.coupons || !Array.isArray(request.coupons)) {
    request.coupons = []
  }
  if (isNaN(request.total_val)) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"total_val" should be number' })
    callback(null, response)
    return
  }
  if (isNaN(request.payment_val)) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"payment_val" should be number' })
    callback(null, response)
    return
  }
  if (isNaN(request.change_val)) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"change_val" should be number' })
    callback(null, response)
    return
  }
  if (typeof request.saled_by !== 'string') {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"saled_by" should be string' })
    callback(null, response)
    return
  }

  var validateCoupon = async (id) => {
    return new Promise((resolve, reject) => {
      conn.query('SELECT * FROM `coupons` WHERE `id` = ? AND `userid` = ?', [ id, event.requestContext.authorizer.claims.sub ], (error, result, fields) => {
        if (error) {
          reject(error)
        }

        if (result[0].left_times < 1) {
          console.log('Left_times = ' + result[0].left_times)
          resolve(false)
        }
        if (result[0].expire_time !== null && new Date(result[0].expire_time) < new Date()) {
          console.log('Expire_time = ' + result[0].expire_time)
          resolve(false)
        }
        resolve(true)
      })
    })
  }

  for (let i = 0; i < request.coupons.length; i++) {
    await validateCoupon(request.coupons[i])
      .then(result => {
        if (!result) {
          response.statusCode = 403
          response.body = JSON.stringify({ message: `The coupon ${request.coupons[i]} is unavailable` })
          callback(null, response)
          process.exit(0)
        }
      })
      .catch(err => {
        response.statusCode = 404
        response.body = JSON.stringify({ message: 'Coupon Not Found' })
        callback(null, response)
        throw err
      })
  }


  var getItemDetails = async (id) => {
    return new Promise((resolve, reject) => {
      conn.query('SELECT * FROM `items` WHERE `id` = ? AND `userid` = ?', [ id, event.requestContext.authorizer.claims.sub ], (error, result, fields) => {
        if (error) {
          reject(error)
        }

        resolve(result[0])
      })
    })
  }


  let items = JSON.parse(JSON.stringify(request.items))
  for (let i = 0; i < Object.keys(items).length; i++) {
    let itemId = Object.keys(items)[i]

    await getItemDetails(itemId)
      .then(result => {
        request.items[itemId] = {
          id: itemId,
          name: result.name,
          price: result.price,
          num: items[itemId]
        }
      })
      .catch(err => {
        response.statusCode = 500
        response.body = JSON.stringify({ message: 'Internal Server Error' })
        callback(null, response)
        throw err
      })
  }

  console.log('items: ' + JSON.stringify((request.items)))

  var getCouponTypeTarget = (id) => {
    return new Promise((resolve, reject) => {
      conn.query('SELECT * FROM `items` WHERE `id` = ? AND `userid` = ?', [ id, event.requestContext.authorizer.claims.sub ], (error, result, fields) => {
        if (error) {
          reject(error)
        }

        resolve(result[0])
      })
    })
  }

  var getCouponTypeDetails = (id) => {
    return new Promise((resolve, reject) => {
      conn.query('SELECT * FROM `coupon_types` WHERE `id` = ? AND `userid` = ?', [ id, event.requestContext.authorizer.claims.sub ], async (error, result, fields) => {
        if (error) {
          reject(error)
        }

        let targets = result.target ? JSON.parse(result.target) : null
        if (targets !== null && targets.length > 0) {
          for (let i = 0; i < targets.length; i++) {
            await getCouponTypeTarget(targets[i])
              .then(item => {
                targets[i] = {
                  id: targets[i],
                  name: item.name,
                  price: item.price
                }
              })
              .catch(error => {
                reject(error)
              })
          }
        }
        result[0].target = targets ? JSON.stringify(targets) : null

        resolve(result[0])
      })
    })
  }

  var getCouponDetails = (id) => {
    return new Promise((resolve, reject) => {
      conn.query('SELECT * FROM `coupons` WHERE `id` = ? AND `userid` = ?', [ id, event.requestContext.authorizer.claims.sub ], async (error, result, fields) => {
        if (error) {
          reject(error)
        }

        await getCouponTypeDetails(result[0].type)
          .then(type => {
            result[0].type = type
            resolve(result[0])
          })
          .catch(error => {
            reject(error)
          })
      })
    })
  }

  
  let coupons = JSON.parse(JSON.stringify(request.coupons))
  request.coupons = []
  for (let i = 0; i < coupons.length; i++) {
    await getCouponDetails(coupons[i])
      .then(result => {
        console.log('push: ' + coupons[i])
        request.coupons.push({
          id: coupons[i],
          name: result.type.name,
          value: result.type.value,
          unit: result.type.unit,
          target: result.type.target,
          left_times: result.left_times,
          limit_times: result.type.limit_times,
          concurrent: result.type.concurrent,
          expire_time: result.expire_time,
          provided: result.provided,
          created_at: result.created_at
        })
      })
      .catch(err => {
        console.log('coupon not found')
        response.statusCode = 500
        response.body = JSON.stringify({ message: 'Internal Server Error' })
        callback(null, response)
        throw err
      })
  }

  console.log('coupons: ' + JSON.stringify((request.coupons)))

  console.log('started registering sale')

  var registerSale = () => {
    return new Promise((resolve, reject) => {
      conn.beginTransaction(error => {
        if (error) {
          reject(error)
        }
    
        console.log('begun transaction')
    
        let values = [ event.requestContext.authorizer.claims.sub, JSON.stringify(request.items), JSON.stringify(request.coupons), request.total_val, request.payment_val, request.change_val, request.saled_by ]
    
        conn.query('INSERT INTO `sales` (`userid`, `items`, `coupons`, `total_val`, `payment_val`, `change_val`, `saled_by`) VALUES (?, ?, ?, ?, ?, ?, ?)', values, async (error, result, fields) => {
          if (error) {
            reject(error)
          }
    
          if (request.coupons.length < 1) {
            console.log('no coupons found. commiting')
            conn.commit(err => {
              if (err) {
                reject(error)
              }
    
              let resBody = {}
              response.body = JSON.stringify(resBody)
    
              resolve()
            })
          } else {
            var useCoupon = id => {
              return new Promise((resolve, reject) => {
                conn.query('UPDATE `coupons` SET `left_times` = `left_times` - 1 WHERE `id` = ?', id, (error, result, fields) => {
                  if (error) {
                    reject(error)
                  }
                  resolve()
                })
              })
            }
            
            for (let i = 0; i < request.coupons.length; i++) {
              await useCoupon(request.coupons[i].id)
                .then(() => {})
                .catch(error => {
                  console.log('failed updating coupons: ' + error)
                  conn.rollback(() => {
                    console.log('rollbacked')
                    reject(error)
                  })
                })
            }
            
            console.log('commiting')
            conn.commit(error => {
              if (error) {
                reject(error)
              }

              let resBody = {}
              response.body = JSON.stringify(resBody)

              resolve()
            })
          }
        })
      })
    })
  }

  await registerSale()
    .then(() => {
      conn.end()
      callback(null, response)
    })
    .catch(error => {
      response.statusCode = 500
      response.body = JSON.stringify({ message: 'Internal Server Error' })
      callback(null, response)
      throw error
    })
  
  console.log('bottom of the code')
}
