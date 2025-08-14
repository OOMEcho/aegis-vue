import Vue from 'vue'
import App from './App.vue'
import VueRouter from "vue-router";
import router from './router';
import {postRequest, getRequest} from "./api/http";
import {Container, Header, Aside, Main, Footer} from 'element-ui';

Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Footer)

Vue.prototype.getRequest = getRequest;
Vue.prototype.postRequest = postRequest;

Vue.config.productionTip = false

Vue.use(VueRouter);

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
