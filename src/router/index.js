import VueRouter from "vue-router";
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import SlideCaptcha from '@/components/SlideCaptcha.vue'
import Layout from '@/components/Layout.vue'
import LoginApp from '@/components/LoginApp.vue'

const originalPush = VueRouter.prototype.push
const originalReplace = VueRouter.prototype.replace

VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
VueRouter.prototype.replace = function replace(location) {
  return originalReplace.call(this, location).catch(err => err);
}

const routes = [
  {
    path: '/',
    name: 'LoginApp',
    component: LoginApp
  },
  {
    path: '/layout',
    name: 'Layout',
    component: Layout
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
});

router.beforeEach((to, from, next) => {
  NProgress.start()
  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router;
