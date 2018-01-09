import Vue from 'vue'
import Vuetify from 'vuetify'
import App from './App.vue'

import '../node_modules/vuetify/dist/vuetify.min.css' // Ensure you are using css-loader

Vue.use(Vuetify);

new Vue({
  el: '#app',
  render: h => h(App)
})
