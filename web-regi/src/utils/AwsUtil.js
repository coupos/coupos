import Amplify, {
  Auth,
  API
} from 'aws-amplify'

Amplify.Logger.LOG_LEVEL = 'INFO'
Amplify.configure({
  Auth: {
    identityPoolId: config.AWS_IDENTITY_POOL_ID,
    region: config.AWS_REGION,
    userPoolId: config.AWS_USER_POOL_ID,
    userPoolWebClientId: config.AWS_USER_POOL_WEB_CLIENT_ID
  },
  API: {
    endpoints: [
      {
        name: 'CouposAPI',
        endpoint: 'https://api.coupos.net/v1/',
        region: config.AWS_REGION,
        custom_header: async () => {
          return { Authorization: (await Auth.currentSession()).idToken.jwtToken }
        }
      }
    ]
  },
  Analytics: {
    disabled: true
  }
})

export function currentAuthenticatedUser () {
  return Auth.currentAuthenticatedUser()
}

export function signUp (username, password, email) {
  return Auth.signUp({
    username,
    password,
    attributes: {
      email
    }
  })
}

export function verify (user, code) {
  return Auth.confirmSignUp(user, code)
}

export function signIn (username, password) {
  return Auth.signIn(username, password)
}

export async function changePassword (oldPassword, newPassword) {
  let ret
  await Auth.currentAuthenticatedUser()
    .then(user => {
      ret = Auth.changePassword(user, oldPassword, newPassword)
    })
    .catch(error => {
      console.log(error)
      ret = null
    })
  return ret
}

export function forgotPassword (username) {
  return Auth.forgotPassword(username)
}
export function forgotPasswordSubmit (username, code, newPassword) {
  return Auth.forgotPasswordSubmit(username, code, newPassword)
}

export function signOut () {
  return Auth.signOut()
}

export function get (api, path) {
  const myInit = {
    headers: {},
    response: true
  }
  return API.get(api, path, myInit)
}

export function post (api, path, body) {
  const myInit = {
    headers: {},
    body,
    response: true
  }
  return API.post(api, path, myInit)
}

export function put (api, path, body) {
  const myInit = {
    headers: {},
    body,
    response: true
  }
  return API.put(api, path, myInit)
}

export function del (api, path) {
  const myInit = {
    headers: {},
    response: true
  }
  return API.del(api, path, myInit)
}
