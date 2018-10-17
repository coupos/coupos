<template>
  <main class="container">
    <header>
      <div class="container">
        <div id="logo">
          <router-link to="/">
            <img src="../assets/logo.svg" />
          </router-link>
        </div>
      </div>
    </header>
    <router-view />
  </main>
</template>

<script>
export default {
  name: 'PublicMain'
}
</script>

<style scoped>
header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;

  height: 50px;

  background-color: #FBA818;
  box-shadow: 0 1px 4px 0px rgba(0, 0, 0, .2);
}
header .container {
  display: flex;

  height: 100%;
  padding: 0;
}
#logo {
  flex: 1 1 auto;
  display: flex;
  align-items: center;

  height: 100%;
  padding-left: 20px;

  font-size: 0;
}
#logo a {
  padding: 13px 0.2rem;
}
#logo img {
  height: 24px;
}

main {
  min-height: 100vh;
  padding-top: 50px;

  background-color: #fff;
}

@media screen and (max-width:600px) {
  #logo {
    padding: 10px;
  }
}
</style>
