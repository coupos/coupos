<template>
  <transition name="slide-down">
    <div @click="unshow" id="errorMessage" v-if="show">
      {{ message }}
    </div>
  </transition>
</template>

<script>
var timeout

export default {
  data () {
    return {
      show: false,
      message: ''
    }
  },
  methods: {
    unshow () {
      this.show = false
    },
    pushMessage (message) {
      this.show = false
      if (timeout) clearTimeout(timeout)

      this.message = message
      this.show = true

      timeout = setTimeout(() => {
        this.show = false
      }, 10000)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#errorMessage {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 200;

  height: 50px;

  font-weight: bold;
  font-size: 1.2rem;
  line-height: 50px;
  text-align: center;
  color: #fff;
  background-color: #FF4747;
  animation: slideFromTop 1s both;
  transform-origin: center top;
}
.slide-down-enter-active {
  transition: all .3s ease-out;
}
.slide-down-leave-active {
  transition: all .3s ease-out;
}
.slide-down-enter, .slide-down-leave-to {
  transform: translateY(-100%);
}
</style>
