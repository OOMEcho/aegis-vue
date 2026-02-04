import Vue from 'vue'
import App from './App.vue'
import VueRouter from "vue-router"
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import '@/assets/iconfont/iconfont.css'
import '@/assets/styles/theme.css'
import '@/assets/styles/common.css'
import '@/assets/styles/auth.css'
import '@/directive/permission'

Vue.use(ElementUI);

Vue.config.productionTip = false

Vue.config.devtools = process.env.NODE_ENV === 'development'

Vue.use(VueRouter);

new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app')
