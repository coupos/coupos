var mysql = require('mysql')

exports.handler = async (event, context, callback) => {
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

  if (!event.pathParameters || !event.pathParameters.id) {
    response.statusCode = 400
    response.body = JSON.stringify({ message: '"id" is not defined' })
    callback(null, response)
    return
  }
  
  /* ショートコードを変換 */
  if (event.pathParameters.id.indexOf('c') < 0) {
    var getCouponIdFromShortcode = code => {
      return new Promise((resolve, reject) => {
        conn.query('SELECT * FROM `coupon_shortcodes` WHERE `shortcode` = ?', code, (error, shortcodes, fields) => {
          if (error) {
            reject(error)
            return
          }
          
          if (shortcodes.length === 0) {
            console.log('The shortcode is not found')
            resolve(null)
            return
          } else if (new Date(shortcodes[0].expire_at) < new Date()) {
            conn.query('DELETE FROM `coupon_shortcodes` WHERE `shortcode` = ?', code, (error, result, fields) => {
              if (error) {
                reject(error)
                return
              }
              
              resolve(null)
              return
            })
          } else {
            conn.query('DELETE FROM `coupon_shortcodes` WHERE `shortcode` = ?', code, (error, result, fields) => {
              if (error) {
                reject(error)
                return
              }
              
              resolve(shortcodes[0])
              return
            })
          }
        })
      })
    }
    
    console.log('converting shortcode to couponid')
    let ret = false
    await getCouponIdFromShortcode(event.pathParameters.id)
      .then(shortcode => {
        console.log('then')
        if (shortcode === null) {
          console.log('null')
          response.statusCode = 403
          response.body = JSON.stringify({ message: 'The shortcode is not available' })
          conn.end()
          callback(null, response)
          ret = true
        } else {
          console.log(shortcode.couponid)
          event.pathParameters.id = shortcode.couponid
        }
      })
      .catch(error => {
        console.log(error)
        conn.destroy()
        callback(error)
        ret = true
      })
    if (ret) {
      console.log('return')
      return
    }
  }
  
  var getCoupon = () => {
    return new Promise((resolve, reject) => {
      console.log('getcoupon')
      conn.query('SELECT * FROM `coupons` WHERE `id` = ?', event.pathParameters.id, (error, coupon, fields) => {
        if (error) {
          reject()
        }
      
        if (coupon.length === 0) {
          response.statusCode = 404
          
          console.log('NotFound : ' + event.pathParameters.id)
          response.body = JSON.stringify({})
      
          resolve()
        }
    
        conn.query('SELECT * FROM `coupon_types` WHERE `id` = ? AND `userid` = ?', [ coupon[0].type, coupon[0].userid ], async (error, type, fields) => {
          if (error) {
            reject()
          }
          
          if (type.length === 0) {
            response.statusCode = 404
            
            console.log('NotFound : ' + event.pathParameters.id)
            response.body = JSON.stringify({})
        
            resolve()
          }
      
          let resBody = {}
          let targetIds = JSON.parse(type[0].target)
          let targets = []
    
          if (targetIds !== null) {
            var getTargetDetail = id => {
              return new Promise((resolve, reject) => {
                conn.query('SELECT * FROM `items` WHERE `id` = ? AND `userid` = ?', [ id, coupon[0].userid ], (error, item, fields) => {
                  if (error) {
                    reject(error)
                  }
                  
                  resolve(item[0])
                })
              })
            }
            
            for (let i = 0; i < targetIds.length; i++) {
              await getTargetDetail(targetIds[i])
                .then(result => {
                  console.log('Push : ' + result)
                  targets.push({
                    id: targetIds[i],
                    name: result.name,
                    price: result.price
                  })
                })
                .catch(error => {
                  reject()
                })
            }
          }
          
          var getUserDetail = id => {
            return new Promise((resolve, reject) => {
              conn.query('SELECT `name`, `description`, `eventid` FROM `regi_users` WHERE `userid` = ?', id, (error, user, fields) => {
                if (error) {
                  reject(error)
                }
                
                resolve(user[0])
              })
            })
          }
          
          let boothInfo = {}
          await getUserDetail(coupon[0].userid)
            .then(result => {
              boothInfo.name = result.name
              boothInfo.description = result.description
              boothInfo.eventid = result.eventid
            })
            .catch(error => {
              reject()
            })
          
          var getEventDetail = id => {
            return new Promise((resolve, reject) => {
              conn.query('SELECT `name`, `description` FROM `event_users` WHERE `userid` = ?', id, (error, user, fields) => {
                if (error) {
                  reject(error)
                }
                
                resolve(user[0])
              })
            })
          }
          
          let eventInfo = {}
          if (boothInfo.eventid !== null) {
            await getEventDetail(boothInfo.eventid)
              .then(result => {
                eventInfo.name = result.name
                eventInfo.description = result.description
              })
              .catch(error => {
                reject()
              })
          }
          
          var generateShortcode = id => {
            return new Promise((resolve, reject) => {
              let shortcode = ('0000000' + Math.floor(Math.random() * 10000000)).slice(-7)
              
              conn.query('SELECT `expire_at` FROM `coupon_shortcodes` WHERE `shortcode` = ?', shortcode, (error, shortcodes, fields) => {
                if (error) {
                  reject(error)
                }
                
                if (shortcodes.length > 0 && new Date(shortcodes[0]) >= new Date()) {
                  resolve(null)
                }
                
                let now = new Date()
                now.setMinutes(now.getMinutes() + 5)
                let expire_at = now.toISOString().slice(0, 19).replace('T', ' ')
                conn.query('REPLACE INTO `coupon_shortcodes` SET `shortcode` = ?, `couponid` = ?, `expire_at` = ?', [ shortcode, id, expire_at ], (error, result, fields) => {
                  if (error) {
                    reject(error)
                  }
                  
                  resolve(shortcode)
                })
              })
            })
          }
          
          let shortcode = null
          if (event.queryStringParameters && event.queryStringParameters.shortcode) {
            for (let i = 5; i > 0; i--) {
              await generateShortcode(coupon[0].id)
                .then(result => {
                  if (result !== null) {
                    shortcode = result
                    i = 0
                  }
                })
                .catch(error => {
                  reject()
                })
            }
          }
      
          if (type.length !== 0) {
            resBody = {
              booth: boothInfo,
              event: boothInfo.eventid !== null ? eventInfo : null,
              id: coupon[0].id,
              shortcode: shortcode ? shortcode : null,
              type: coupon[0].type,
              name: type[0].name,
              value: type[0].value,
              unit: type[0].unit,
              target: targets,
              left_times: coupon[0].left_times,
              limit_times: type[0].limit_times,
              concurrent: type[0].concurrent,
              expire_time: coupon[0].expire_time,
              provided: coupon[0].provided,
              created_at: coupon[0].created_at
            }
          } else {
            response.statusCode = 403
            resBody = {}
          }
      
          console.log('Success')
          response.body = JSON.stringify(resBody)
          resolve()
        })
      })
    })
  }
  
  await getCoupon()
    .then(() => {
      conn.end()
      callback(null, response)
    })
    .catch(error => {
      response.statusCode = 500
      response.body = JSON.stringify({ message: 'Internal Server Error' })
      conn.end()
      callback(null, response)
      throw error
    })
}
