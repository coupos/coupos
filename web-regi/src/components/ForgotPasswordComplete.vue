<template>
  <div>
    <div id="sign-up">
      <h1>メールを送信しました</h1>
      <div id="icon">
        <font-awesome-icon :icon="['fas', 'envelope']"></font-awesome-icon>
      </div>
      <p>続いて、届いたメールに書かれたリンクからパスワードを再設定します。</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ForgotPasswordComplete'
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
