import VueRouter from "vue-router";
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import LayoutComponent from '@/components/Layout/index.vue'
import SlideCaptchaComponent from '@/components/SlideCaptcha/index'
import LoginComponent from '@/components/Login/index'

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
    name: 'login',
    component: LoginComponent
  },
  {
    path: '/layout',
    name: 'layout',
    component: LayoutComponent
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
