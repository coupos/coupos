<template>
  <main class="container">
    <header>
      <div class="container">
        <div id="menu" @click="showSidebar = !showSidebar">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div id="logo">
          <router-link to="/regi">
            <img src="../assets/logo.svg" />
            <span>レジ</span>
          </router-link>
        </div>
      </div>
    </header>
    <transition name="fade">
      <div v-show="showSidebar" id="sidebar-wrapper" @click="showSidebar = false"></div>
    </transition>
    <transition name="slide-right">
      <div v-show="showSidebar" id="sidebar">
        <ul>
          <li><router-link @click.native="closeSidebar()" :to="{ name: 'Top' }">トップページ</router-link></li>
          <li v-if="signedin" class="break"></li>
          <li v-if="signedin"><router-link @click.native="closeSidebar()" :to="{ name: 'Dashboard' }">ダッシュボード</router-link></li>
          <li v-if="signedin"><router-link @click.native="closeSidebar()" :to="{ name: 'Sale' }">売上登録</router-link></li>
          <li v-if="signedin"><router-link @click.native="closeSidebar()" :to="{ name: 'ItemManager' }">商品管理</router-link></li>
          <li v-if="signedin"><router-link @click.native="closeSidebar()" :to="{ name: 'CouponManager' }">クーポン管理</router-link></li>
          <li v-if="signedin"><router-link @click.native="closeSidebar()" :to="{ name: 'StaffManager' }">スタッフ管理</router-link></li>
          <li v-if="signedin" class="break"></li>
          <li v-if="signedin"><router-link @click.native="closeSidebar()" :to="{ name: 'Configure' }">設定</router-link></li>
          <li v-if="signedin"><router-link @click.native="closeSidebar()" :to="{ name: 'SignOut' }">ログアウト</router-link></li>
          <li v-if="!signedin"><router-link @click.native="closeSidebar()" :to="{ name: 'SignIn' }">ログイン</router-link></li>
        </ul>
      </div>
    </transition>
    <router-view />
  </main>
</template>

<script>
import * as AwsUtil from '@/utils/AwsUtil'

export default {
  name: 'RegiMain',
  data () {
    return {
      showSidebar: false,
      signedin: false
    }
  },
  methods: {
    closeSidebar () {
      this.showSidebar = false
    }
  },
  created () {
    AwsUtil.currentAuthenticatedUser()
      .then(response => {
        console.log(response)
        this.signedin = true
      })
      .catch(error => {
        console.log(error)
        this.signedin = false
      })
  }
}
</script>

<style scoped>
.container {
  max-width: 1600px;
}

header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 102;

  height: 50px;

  background-color: #FBA818;
  box-shadow: 0 1px 4px 0px rgba(0, 0, 0, .2);
}
header .container {
  display: flex;

  height: 100%;
  padding: 0;
}
#menu {
  flex: 0 0 50px;
  position: relative;
  box-sizing: border-box;

  width: 50px;
  height: 50px;

  cursor: pointer;
}
#menu span {
  display: inline-block;
  box-sizing: border-box;
  position: absolute;
  left: 12px;

  width: 26px;
  height: 4px;

  background-color: #fff;
  border-radius: 4px;
  transition: all .3s;
}
#menu span:nth-of-type(1) {
  top: 14px;
}
#menu span:nth-of-type(2) {
  top: 23px;
}
#menu span:nth-of-type(3) {
  bottom: 14px;
}
#menu.active span:nth-of-type(1) {
  -webkit-transform: translateY(9px) rotate(-45deg);
  transform: translateY(9px) rotate(-45deg);
}
#menu.active span:nth-of-type(2) {
  opacity: 0;
}
#menu.active span:nth-of-type(3) {
  -webkit-transform: translateY(-9px) rotate(45deg);
  transform: translateY(-9px) rotate(45deg);
}
#logo {
  flex: 1 1 auto;
  display: flex;
  align-items: center;

  height: 100%;
  padding-left: 0.3rem;

  font-size: 0;
}
#logo a {
  display: flex;
  align-items: flex-end;
  height: 24px;
  padding: 0 0.2rem;
}
#logo img {
  flex: 0 0 auto;
  height: 24px;
}
#logo span {
  flex: 0 0 auto;
  margin-left: 0.2rem;

  font-weight: bold;
  font-size: 23px;
  line-height: 0.8em;
  color: #fff;
}

#sidebar-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;

  background-color: rgba(0, 0, 0, .7);
}
#sidebar-wrapper.fade-enter-active {
  transition: all .2s;
}
#sidebar-wrapper.fade-leave-active {
  transition: all .5s;
}
#sidebar-wrapper.fade-enter, #sidebar-wrapper.fade-leave-to {
  opacity: 0;
}
#sidebar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 101;

  min-width: 25vw;
  height: 100vh;
  padding: 50px 1rem 0 1rem;

  background-color: #fff;
  box-shadow: 0 1px 4px 0px rgba(0, 0, 0, .2);
  overflow-y: scroll;
}
#sidebar.slide-right-enter-active {
  transition: all .2s ease-out;
}
#sidebar.slide-right-leave-active {
  transition: all .5s ease-out;
}
#sidebar.slide-right-enter, #sidebar.slide-right-leave-to {
  transform: translateX(-100%);
}
#sidebar ul {
  width: 100%;
  height: 100%;
}
#sidebar li {
  border-bottom: 1px solid #ccc;
}
#sidebar li.break {
  position: relative;

  margin-top: 3.75rem;
  border-bottom: 1px solid #ccc;
}
#sidebar li a {
  display: block;

  padding: 1rem;

  font-weight: bold;
  font-size: 1rem;
  line-height: 1.75rem;
  color: #444;
}

main {
  min-height: 100vh;
  padding-top: 50px;

  background-color: #fff;
}

@media screen and (max-width:600px) {
  #sidebar {
    min-width: 70vw;
  }
}
</style>
