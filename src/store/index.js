import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth'
import permission from './modules/permission'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    auth,
    permission
  }
})
