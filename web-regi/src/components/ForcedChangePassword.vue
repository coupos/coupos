<template>
  <div id="change-password">
    <h1>パスワードを変更</h1>
    <form @submit.stop.prevent="submit()" method="post">
      <span v-if="error.submit !== ''" class="error">{{ error.submit }}</span>
      <div>
        <input type="password" placeholder=" " v-model="input.oldPassword" @blur="validate('oldPassword')" required />
        <span :class="{ active: input.oldPassword !== '' }">現在のパスワード</span>
        <span v-if="error.oldPassword !== ''" class="error">{{ error.oldPassword }}</span>
      </div>
      <div>
        <input type="password" placeholder=" " v-model="input.newPassword" @blur="validate('newPassword')" required />
        <span :class="{ active: input.newPassword !== '' }">新しいパスワード</span>
        <span v-if="error.newPassword !== ''" class="error">{{ error.newPassword }}</span>
      </div>
      <div>
        <input type="password" placeholder=" " v-model="input.newPasswordCheck" @blur="validate('newPasswordCheck')" required />
        <span :class="{ active: input.newPasswordCheck !== '' }">新しいパスワード (確認)</span>
        <span v-if="error.newPasswordCheck !== ''" class="error">{{ error.newPasswordCheck }}</span>
      </div>
      <input type="submit" hidden />
      <a class="button sign-up" @click="submit()">変更</a>
    </form>
  </div>
</template>

<script>
import * as AwsUtil from '@/utils/AwsUtil'

export default {
  name: 'ChangePassword',
  data () {
    return {
      input: {
        oldPassword: '',
        newPassword: '',
        newPasswordCheck: ''
      },
      error: {
        oldPassword: '',
        newPassword: '',
        newPasswordCheck: '',
        submit: ''
      }
    }
  },
  methods: {
    validate (only = null) {
      this.$set(this.error, 'submit', '')

      if (only === null || only === 'oldPassword') {
        if (!this.input.oldPassword || this.input.oldPassword === '') {
          this.$set(this.error, 'oldPassword', '入力してください')
          return false
        } else if (this.input.oldPassword.length < 6) {
          this.$set(this.error, 'oldPassword', '6文字以上で入力してください')
          return false
        } else {
          this.$set(this.error, 'oldPassword', '')
        }
      }

      if (only === null || only === 'newPassword') {
        if (!this.input.newPassword || this.input.newPassword === '') {
          this.$set(this.error, 'newPassword', '入力してください')
          return false
        } else if (this.input.newPassword.length < 6) {
          this.$set(this.error, 'newPassword', '6文字以上で入力してください')
          return false
        } else {
          this.$set(this.error, 'newPassword', '')
        }
      }

      if (only === null || only === 'newPasswordCheck') {
        if (this.input.newPasswordCheck !== this.input.newPassword) {
          this.$set(this.error, 'newPasswordCheck', '一致しません')
          return false
        } else {
          this.$set(this.error, 'newPasswordCheck', '')
        }
      }

      return true
    },
    submit () {
      if (!this.validate()) {
        return
      }

      try {
        AwsUtil.changePassword(this.input.oldPassword, this.input.newPassword)
          .then(response => {
            console.log(response)
            this.$router.push({ name: 'ChangePasswordComplete' })
          })
          .catch(err => {
            if (err.code === 'NotAuthorizedException') {
              this.$set(this.error, 'submit', '現在のパスワードに間違いがあります')
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
#change-password {
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
