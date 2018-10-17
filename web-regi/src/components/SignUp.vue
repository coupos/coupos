<template>
  <div>
    <div id="sign-up">
      <h1>新規登録</h1>
      <form @submit.stop.prevent="signUp()" method="post">
        <span class="error">{{ error.signup }}</span>
        <div>
          <input type="text" placeholder=" " v-model="input.userid" @blur="validate('userid')" required />
          <span :class="{ active: input.userid !== '' }">ユーザーID</span>
          <span v-if="error.userid !== ''" class="error">{{ error.userid }}</span>
        </div>
        <div>
          <input type="password" placeholder=" " v-model="input.password" @blur="validate('password')" required />
          <span :class="{ active: input.password !== '' }">パスワード</span>
          <span v-if="error.password !== ''" class="error">{{ error.password }}</span>
        </div>
        <div>
          <input type="password" placeholder=" " v-model="input.passwordCheck" @blur="validate('passwordCheck')" required />
          <span :class="{ active: input.password !== '' }">パスワード (確認)</span>
          <span v-if="error.passwordCheck !== ''" class="error">{{ error.passwordCheck }}</span>
        </div>
        <div>
          <input type="text" placeholder=" " v-model="input.email" @blur="validate('email')" required />
          <span :class="{ active: input.email !== '' }">メールアドレス</span>
          <span v-if="error.email !== ''" class="error">{{ error.email }}</span>
        </div>
        <input type="submit" hidden />
        <a class="button sign-up" @click="signUp()" href="#">新規登録</a>
      </form>
    </div>
    <div class="border"></div>
    <div id="sign-in">
      <h2>アカウントをお持ちですか？</h2>
      <router-link :to="{ name: 'SignIn' }" class="button sign-in">ログイン</router-link>
    </div>
  </div>
</template>

<script>
import * as AwsUtil from '@/utils/AwsUtil'

export default {
  name: 'SignUp',
  data () {
    return {
      input: {
        userid: '',
        password: '',
        passwordCheck: '',
        email: ''
      },
      error: {
        signup: '',
        userid: '',
        password: '',
        passwordCheck: '',
        email: ''
      }
    }
  },
  methods: {
    validate (only = null) {
      this.$set(this.error, 'signup', '')

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

      if (only === null || only === 'passwordCheck') {
        if (this.input.passwordCheck !== this.input.password) {
          this.$set(this.error, 'passwordCheck', '一致しません')
          return false
        } else {
          this.$set(this.error, 'passwordCheck', '')
        }
      }

      if (only === null || only === 'email') {
        if (!this.input.email || this.input.email === '') {
          this.$set(this.error, 'email', '入力してください')
          return false
        } else if (this.input.email.indexOf('@') < 1 || this.input.email.indexOf('@') > this.input.email.length - 2) {
          this.$set(this.error, 'email', 'メールアドレスの形式が正しくありません')
          return false
        } else {
          this.$set(this.error, 'email', '')
        }
      }

      return true
    },
    signUp () {
      if (!this.validate()) return

      try {
        AwsUtil.signUp(this.input.userid, this.input.password, this.input.email)
          .then(response => {
            console.log(response)
            this.$router.push({ name: 'SignUpComplete' })
          })
          .catch(err => {
            if (err.code === 'UsernameExistsException') {
              this.$set(this.error, 'signup', '指定されたユーザーIDは既に使われています。')
            } else if (err.code === 'UserLambdaValidationException') {
              this.$set(this.error, 'signup', 'エラーが発生しました。時間を空けて再度お試しください。')
            }
            console.log(err)
          })
      } catch (e) {
        console.log(e.message)
      }
    }
  }
}
</script>

<style scoped>
#sign-up {
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

.button.sign-up {
  width: 100%;
  margin-top: 1.5rem;
}

.border {
  max-width: 40rem;
  margin: 2rem auto 0 auto;
  border-top: 1px solid #ccc;
}

#sign-in {
  padding: 0 3rem;
  margin: 2rem auto 0 auto;

  text-align: center;
}
#sign-in h2 {
  margin-top: 2rem;

  font-size: 1.3rem;
  color: #444;
}
.button.sign-in {
  width: 100%;
  max-width: 20rem;
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
</style>
