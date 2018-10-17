<template>
  <div>
    <div id="sign-in">
      <h1>ログイン</h1>
      <form @submit.stop.prevent="signIn()" method="post">
        <span class="error">{{ error.signin }}</span>
        <div>
          <input type="text" placeholder=" " v-model="input.userid" @blur="validate('userid')" required />
          <span :class="{ active: input.userid !== '' }">ユーザーID または メールアドレス</span>
          <span v-if="error.userid !== ''" class="error">{{ error.userid }}</span>
        </div>
        <div>
          <input type="password" placeholder=" " v-model="input.password" @blur="validate('password')" required />
          <span :class="{ active: input.password !== '' }">パスワード</span>
          <span v-if="error.password !== ''" class="error">{{ error.password }}</span>
        </div>
        <input type="submit" hidden />
        <a class="button sign-in" @click="signIn()"><font-awesome-icon v-if="connecting" :icon="['fas', 'spinner']" pulse style="margin-right: 0.5rem"></font-awesome-icon>ログイン</a>
        <div id="forgot-password" v-if="error.signin">
          <router-link :to="{ name: 'ForgotPassword' }">パスワードをお忘れですか？</router-link>
        </div>
      </form>
    </div>
    <div class="border"></div>
    <div id="sign-up">
      <h2>アカウントをお持ちではありませんか？</h2>
      <router-link :to="{ name: 'SignUp' }" class="button sign-up">新規登録</router-link>
    </div>
  </div>
</template>

<script>
import * as AwsUtil from '@/utils/AwsUtil'

export default {
  name: 'SignIn',
  data () {
    return {
      input: {
        userid: '',
        password: ''
      },
      error: {
        userid: '',
        password: '',
        signin: ''
      },
      connecting: false
    }
  },
  methods: {
    validate (only = null) {
      this.$set(this.error, 'signin', '')

      if (only === null || only === 'userid') {
        if (!this.input.userid || this.input.userid === '') {
          this.$set(this.error, 'userid', '入力してください')
          return false
        } else {
          this.$set(this.error, 'userid', '')
        }
      }

      if (only === null || only === 'password') {
        if (!this.input.password || this.input.password === '') {
          this.$set(this.error, 'password', '入力してください')
          return false
        } else if (this.input.password.length < 6) {
          this.$set(this.error, 'password', '6文字以上で入力してください')
          return false
        } else {
          this.$set(this.error, 'password', '')
        }
      }

      return true
    },
    signIn () {
      if (!this.validate()) return

      this.connecting = true
      AwsUtil.signIn(this.input.userid, this.input.password)
        .then(response => {
          console.log('サインイン')
          this.connecting = false
          this.$parent.signedin = true
          this.$router.push({ name: 'Dashboard' })
        })
        .catch(err => {
          this.connecting = false
          console.log(err)
          if (err.code === 'NotAuthorizedException' || err.code === 'UserNotFoundException') {
            this.$set(this.error, 'signin', 'ユーザーIDもしくはパスワードが間違っています。')
          } else if (err.code === 'UserNotConfirmedException') {
            this.$set(this.error, 'signin', '届いたメールからメールアドレス認証を行ってください。')
          } else {
            this.$set(this.error, 'signin', '問題が発生しました。しばらくしてからもう一度お試しください。')
            console.log(err)
          }
        })
    }
  }
}
</script>

<style scoped>
#sign-in {
  width: auto;
  max-width: 20rem;
  margin: 0 auto;

  text-align: center;
}

h1 {
  width: auto;
  margin-top: 1rem;

  font-size: 1.8rem;
  color: #444;
}

form {
  margin-top: 1rem;
}
form div {
  display: block;
  position: relative;

  max-width: 20rem;
  margin: 1.5rem auto 0 auto;
}
form div:first-child {
  margin-top: 0;
}
form input {
  width: 100%;
  border-bottom: 1px solid #ccc;
  border-radius: 3px;

  font-size: 1rem;
  line-height: 2.5rem;
}
form input:not(:placeholder-shown) {
  border-bottom: 1px solid #07f;
}
form input:focus {
  border-bottom: 1px solid #07f;
}
form input + span {
  position: absolute;
  top: 0;
  left: 0;

  font-size: 1rem;
  line-height: 2.5rem;
  color: #aaa;
  pointer-events: none;
  transition: all 0.2s ease;
  transform-origin: 0 0;
}
form input:not(:placeholder-shown) + span {
  color: #07f;
  transform: translateY(-1.25rem) scale(0.8);
}
form input:focus + span {
  color: #07f;
  transform: translateY(-1.25rem) scale(0.8);
}
form span.error {
  display: block;

  width: 100%;
  margin-top: .2rem;

  font-size: 0.95rem;
  color: #FF4747;
  text-align: left;
}

#forgot-password {
  margin: 0;
}
#forgot-password a {
  font-size: 1.1rem;
  font-weight: bold;
  color: #07f;
}

.button.sign-in {
  width: 100%;
  margin-top: 1.5rem;

  background-color: hsl(38, 96%, 53%);
  box-shadow: 0 3px 0 hsl(38, 96%, 38%);
}
.button.sign-in:hover {
  background-color: hsl(38, 96%, 60%);
  box-shadow: 0 3px 0 hsl(38, 96%, 43%);
}
.button.sign-in:active {
  box-shadow: none;
}

.border {
  max-width: 40rem;
  margin: 2rem auto 0 auto;
  border-top: 1px solid #ccc;
}

#sign-up {
  padding: 0 3rem;
  margin: 2rem auto 0 auto;

  text-align: center;
}
#sign-up h2 {
  margin-top: 2rem;

  font-size: 1.3rem;
  color: #444;
}
.button.sign-up {
  width: 100%;
  max-width: 20rem;
  margin-top: 1.5rem;
}
</style>
