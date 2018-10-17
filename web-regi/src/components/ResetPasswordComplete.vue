<template>
  <div>
    <div id="complete">
      <h1>パスワードを再設定しました</h1>
      <div id="icon">
        <font-awesome-icon :icon="['fas', 'check']"></font-awesome-icon>
      </div>
      <p>早速ログインしましょう！</p>
      <router-link class="button sign-in" :to="{ name: 'SignIn' }">ログイン</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SignUpComplete'
}
</script>

<style scoped>
#complete {
  width: auto;
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
  margin-top: 1rem;
  font-size: 1.2rem;
}
</style>
