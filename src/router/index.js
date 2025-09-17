import VueRouter from "vue-router";
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import LayoutPage from '@/components/LayoutPage.vue'
import LoginPage from '@/components/LoginPage.vue'
import HomePage from '@/components/HomePage.vue'

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
    name: 'HomePage',
    component: HomePage
  },
  {
    path: '/login',
    name: 'LoginApp',
    component: LoginPage
  },
  {
    path: '/layout',
    name: 'Layout',
    component: LayoutPage
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
