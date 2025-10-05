import VueRouter from "vue-router";
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import store from '@/store'
import {getRouters} from '@/api/profile';

import LayoutComponent from '@/components/Layout/index.vue'
import LoginComponent from '@/components/Login/index'
import RegisterComponent from '@/components/Register/index'

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
    path: '/register',
    name: 'register',
    component: RegisterComponent
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

router.beforeEach(async (to, from, next) => {
  NProgress.start()

  const accessToken = sessionStorage.getItem('accessToken')

  if (accessToken) {
    if (to.path === '/login') {
      next({path: '/'})
      NProgress.done()
    } else {
      // 判断是否已加载动态路由
      const hasRoutes = store.state.permission.routes && store.state.permission.routes.length > 0

      if (hasRoutes) {
        next()
      } else {
        try {
          // 获取后端返回的路由数据
          const accessRoutes = await store.dispatch('permission/generateRoutes', await getRouters())

          // 动态添加路由
          accessRoutes.forEach(route => {
            router.addRoute(route)
          })

          // 重要：使用 replace 避免留下历史记录
          next({...to, replace: true})
        } catch (error) {
          console.error('获取路由失败', error)
          next('/')
          NProgress.done()
        }
      }
    }
  } else {
    if (to.path === '/' || to.path === '/register') {
      next()
    } else {
      next('/')
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router;
