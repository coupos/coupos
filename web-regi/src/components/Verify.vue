<template>
  <div>
    <div id="sign-up">
      <div v-if="state === 'verifying'">
        <h1>認証中</h1>
      </div>
      <div v-else-if="state === 'verified'">
        <h1>認証完了</h1>
        <div id="icon">
          <font-awesome-icon :icon="['fas', 'check']"></font-awesome-icon>
        </div>
        <h2>メールアドレスが認証されました</h2>
        <p>早速使ってみましょう！</p>
        <router-link class="button sign-in" :to="{ name: 'SignIn' }">ログイン</router-link>
      </div>
      <div v-else>
        <h1>問題が発生しました</h1>
        <p>お時間を空けてもう一度お試しください。</p>
      </div>
    </div>
  </div>
</template>

<script>
import * as AwsUtil from '@/utils/AwsUtil'

export default {
  name: 'SignUp',
  data () {
    return {
      state: 'verifying'
    }
  },
  created () {
    if (!this.$route.query || !this.$route.query.u || !this.$route.query.c) {
      this.state = 'notverified'
      console.log('nocode')
      return
    }

    AwsUtil.verify(this.$route.query.u, this.$route.query.c)
      .then(response => {
        this.state = 'verified'
      })
      .catch(err => {
        console.log('failed')
        console.log(err)
        this.state = 'notverified'
      })
  }
}
</script>

<style scoped>
#sign-up {
  width: auto;
  margin: 0 auto;

  text-align: center;
}

h1 {
  width: auto;
  margin-top: 1rem;

  font-size: 1.8rem;
  color: #444;
}

#icon {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 120px;
  height: 120px;
  margin: 1rem auto 0 auto;
  border-radius: 50%;

  background-color: hsl(38, 96%, 53%);
}
#icon svg {
  font-size: 60px;
  color: #fff;
}

h2 {
  margin-top: 1rem;

  font-size: 1.5rem;
  color: #444;
}

p {
  margin-top: 0.5rem;
  font-size: 1.2rem;
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
