// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import ToggleButton from 'vue-js-toggle-button'
import VueQriously from 'vue-qriously'
import App from './App'
import router from './router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faBackspace, faCaretDown, faCaretUp, faCheck, faClone, faCopy, faEnvelope, faInfoCircle, faMale, faPlus, faSpinner, faSquare, faSync, faPen, faTimes, faTrashAlt, faUsers, faYenSign } from '@fortawesome/free-solid-svg-icons'
import { faCircle } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faBackspace, faCaretDown, faCaretUp, faCircle, faCheck, faClone, faCopy, faEnvelope, faInfoCircle, faMale, faPlus, faSpinner, faSquare, faSync, faPen, faTimes, faTrashAlt, faUsers, faYenSign)

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.use(ToggleButton)
Vue.use(VueQriously)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
