import VueRouter from "vue-router";
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import layout from '@/components/Layout/index.vue'
import slideCaptcha from '@/components/SlideCaptcha/index'

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
    name: 'slideCaptcha',
    component: slideCaptcha
  },
  {
    path: '/layout',
    name: 'layout',
    component: layout
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
