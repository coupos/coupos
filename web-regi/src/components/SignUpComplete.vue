<template>
  <div>
    <div id="sign-up">
      <h1>仮登録が完了しました</h1>
      <div id="icon">
        <font-awesome-icon :icon="['fas', 'envelope']"></font-awesome-icon>
      </div>
      <h2>メールアドレスの認証が必要です</h2>
      <p>確認メール内の認証リンクへアクセスしてください。</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SignUpComplete'
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
</style>
