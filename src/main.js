import Vue from 'vue'
import App from './App.vue'
import VueRouter from "vue-router"
import router from './router'
import store from './store'
import {Container, Header, Aside, Main, Footer, Button, MessageBox, Message, Dialog} from 'element-ui';

Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Footer)
Vue.use(Button)
Vue.use(Dialog)
Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$prompt = MessageBox.prompt;
Vue.prototype.$message = Message;

Vue.config.productionTip = false

Vue.use(VueRouter);

new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app')
