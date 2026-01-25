import VueRouter from "vue-router";
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import store from '@/store'
import {getUserInfo} from '@/api/profile';

import LayoutComponent from '@/components/Layout/index.vue'
import LoginComponent from '@/components/Login/index'
import RegisterComponent from '@/components/Register/index'
import DashboardPage from '@/views/dashboard/index.vue'
import ProfilePage from '@/views/profile/index.vue'
import NotFoundPage from '@/views/404/index.vue'

const originalPush = VueRouter.prototype.push
const originalReplace = VueRouter.prototype.replace

VueRouter.prototype.push = function push(location) {
  // 兼容重复跳转导致的报错
  return originalPush.call(this, location).catch(err => err)
}
VueRouter.prototype.replace = function replace(location) {
  // 兼容重复跳转导致的报错
  return originalReplace.call(this, location).catch(err => err);
}

// 静态路由：登录/注册/布局 + 首页/个人中心
const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginComponent
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterComponent
  },
  {
    path: '/',
    name: 'layout',
    component: LayoutComponent,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardPage,
        meta: {
          title: '首页',
          affix: true
        }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: ProfilePage,
        meta: {
          title: '个人中心'
        }
      },
      {
        path: '404',
        name: 'NotFound',
        component: NotFoundPage,
        meta: {
          title: '页面不存在'
        },
        hidden: true
      }
    ]
  }
]

const createRouter = () => new VueRouter({
  mode: 'history',
  routes
});

const router = createRouter();
let is404Added = false

router.beforeEach(async (to, from, next) => {
  NProgress.start()

  const accessToken = sessionStorage.getItem('accessToken')

  if (accessToken) {
    if (to.path === '/login' || to.path === '/register') {
      next({path: '/'})
      NProgress.done()
    } else {
      // 判断是否已加载动态路由
      const hasRoutes = store.state.permission.routes && store.state.permission.routes.length > 0

      if (hasRoutes) {
        next()
      } else {
        try {
          const userInfo = await getUserInfo()
          const accessRoutes = await store.dispatch('permission/generateRoutes', userInfo)

          // 动态添加路由（后端返回的菜单结构）
          accessRoutes.forEach(route => {
            router.addRoute('layout', route)
          })

          if (!is404Added) {
            router.addRoute({
              path: '*',
              redirect: '/404'
            })
            is404Added = true
          }

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
    if (to.path === '/login' || to.path === '/register') {
      next()
    } else {
      next('/login')
      NProgress.done()
    }
  }
})

router.afterEach((to) => {
  if (to.path !== '/login' && to.path !== '/register' && to.path !== '/404') {
    if (to.meta && to.meta.title) {
      store.dispatch('tagsView/addView', to)
    }
  }
  NProgress.done()
})

export function resetRouter() {
  router.matcher = createRouter().matcher
}

export default router;
