<template>
  <div>
    <div id="config">
      <h1>設定の変更</h1>
      <form @submit.stop.prevent="submit()" method="post">
        <span class="error">{{ error.submit }}</span>
        <div>
          <input type="text" placeholder=" " v-model="input.name" @blur="validate('name')" required />
          <span :class="{ active: input.name !== '' }">ブース名</span>
          <span v-if="error.name !== ''" class="error">{{ error.name }}</span>
        </div>
        <div>
          <textarea type="text" placeholder=" " v-model="input.description" @blur="validate('description')" required></textarea>
          <span :class="{ active: input.description !== '' }">ブース説明 (任意)</span>
          <span v-if="error.description !== ''" class="error">{{ error.description }}</span>
        </div>
        <input type="submit" hidden />
        <a class="button sign-in" @click="submit()" href="#">変更する</a>
      </form>
    </div>
    <div id="change-password">
      <router-link class="link" :to="{ name: 'ChangePassword' }">パスワードを変更</router-link>
    </div>
  </div>
</template>

<script>
import * as AwsUtil from '@/utils/AwsUtil'

export default {
  name: 'FirstConfigure',
  data () {
    return {
      input: {
        name: '',
        description: ''
      },
      error: {
        name: '',
        description: '',
        submit: ''
      }
    }
  },
  methods: {
    validate (only = null) {
      this.$set(this.error, 'submit', '')

      if (only === null || only === 'name') {
        if (!this.input.name || this.input.name === '') {
          this.$set(this.error, 'name', '入力してください')
          return false
        } else if (this.input.name.length > 30) {
          this.$set(this.error, 'name', '50文字以内で入力してください')
          return false
        } else {
          this.$set(this.error, 'name', '')
        }
      }

      if (only === null || only === 'description') {
        if (this.input.description && this.input.description.length > 100) {
          this.$set(this.error, 'description', '100文字以内で入力してください')
          return false
        } else {
          this.$set(this.error, 'description', '')
        }
      }

      return true
    },
    submit () {
      if (!this.validate()) return

      AwsUtil.put('CouposAPI', 'regi', this.input)
        .then(response => {
          console.log('ユーザー情報を設定 : ' + response.status)
          this.$router.push({ name: 'Dashboard' })
        })
        .catch(error => {
          this.$set(this.error, 'submit', '問題が発生しました。時間を空けて再度お試しください。')
          console.log(JSON.stringify(error))
        })
    }
  },
  created () {
    AwsUtil.get('CouposAPI', 'regi')
      .then(response => {
        console.log('ユーザー情報を取得 : ' + response.status)
        this.input.name = response.data.name
        this.input.description = response.data.description
      })
      .catch(error => {
        console.log(JSON.stringify(error))
      })
  }
}
</script>

<style scoped>
#config {
  width: auto;
  max-width: 20rem;
  margin: 0 auto;

  text-align: center;
}
#change-password {
  width: auto;
  max-width: 24rem;
  margin: 2rem auto 0 auto;
  padding-top: 2rem;
  border-top: 1px solid #ccc;

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

  margin: 1.5rem 0 0 0;
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
form textarea {
  width: 100%;
  height: 4.6em;
  padding-top: 0.6rem;
  border-bottom: 1px solid #ccc;
  border-radius: 3px;

  font-size: 1rem;
  line-height: 1.3rem;
  resize: vertical;
}
form textarea:not(:placeholder-shown) {
  border-bottom: 1px solid #07f;
}
form textarea:focus {
  border-bottom: 1px solid #07f;
}
form input + span, form textarea + span {
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
form textarea + span {
  line-height: 1.3rem;
}
form input:not(:placeholder-shown) + span, form textarea:not(:placeholder-shown) + span {
  color: #07f;
  transform: translateY(-1.25rem) scale(0.8);
  line-height: 2.5rem;
}
form input:focus + span, form textarea:focus + span {
  color: #07f;
  transform: translateY(-1.25rem) scale(0.8);
  line-height: 2.5rem;
}
form span.error {
  display: block;

  width: 100%;
  margin-top: .2rem;

  font-size: 0.95rem;
  color: #FF4747;
  text-align: left;
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

a.link {
  color: #07f;
  font-size: 1.1rem;
  font-weight: bold;
}
</style>
