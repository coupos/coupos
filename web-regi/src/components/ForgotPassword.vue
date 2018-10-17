<template>
  <div id="forgot-password">
    <h1>パスワードの再設定をリクエスト</h1>
    <p>パスワードをお忘れの場合、一度リセットした後に再設定できます。</p>
    <form @submit.stop.prevent="submit()" method="post">
      <span v-if="error.submit !== ''" class="error">{{ error.submit }}</span>
      <div>
        <input type="email" placeholder=" " v-model="input.email" @blur="validate('email')" required />
        <span :class="{ active: input.email !== '' }">メールアドレス</span>
        <span v-if="error.email !== ''" class="error">{{ error.email }}</span>
      </div>
      <input type="submit" hidden />
      <a class="button sign-up" @click="submit()" href="#">再設定をリクエスト</a>
    </form>
  </div>
</template>

<script>
import * as AwsUtil from '@/utils/AwsUtil'

export default {
  name: 'ForgotPassword',
  data () {
    return {
      input: {
        email: ''
      },
      error: {
        email: '',
        submit: ''
      }
    }
  },
  methods: {
    validate (only = null) {
      this.$set(this.error, 'submit', '')

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
    submit () {
      if (!this.validate()) {
        return
      }

      try {
        AwsUtil.forgotPassword(this.input.email)
          .then(response => {
            console.log(response)
            this.$router.push({ name: 'ForgotPasswordComplete' })
          })
          .catch(err => {
            if (err.code === 'UserNotFoundException') {
              this.$set(this.error, 'submit', 'このメールアドレスは登録されていません')
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
#forgot-password {
  width: auto;
  max-width: 31rem;
  margin: 0 auto;

  text-align: center;
}

h1 {
  width: auto;
  margin-top: 1rem;
  margin-bottom: 1rem;

  font-size: 1.8rem;
  color: #444;
}

p {
  text-align: left;
  color: #666;
}

form {
  margin-top: 1rem;
}
form div {
  display: block;
  position: relative;

  max-width: 31rem;
  margin: 1.5rem auto 0 auto;
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
