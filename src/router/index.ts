import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import LayoutComponent from '@/components/Layout/index.vue'
import LoginComponent from '@/components/Login/index.vue'
import RegisterComponent from '@/components/Register/index.vue'
import DashboardPage from '@/views/dashboard/index.vue'
import ProfilePage from '@/views/profile/index.vue'
import NotFoundPage from '@/views/404/index.vue'

export const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    meta: { title: '登录' },
    component: LoginComponent
  },
  {
    path: '/register',
    name: 'register',
    meta: { title: '注册' },
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
        meta: { title: '首页', affix: true, icon: 'icon-pingtaizijiankong' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: ProfilePage,
        meta: { title: '个人中心', icon: 'icon-baimingdanguanli' }
      },
      {
        path: '404',
        name: 'NotFound',
        component: NotFoundPage,
        meta: { title: '页面不存在' },
        // 与 Vue2 一致：hidden 放路由顶层供 Aside 过滤
        // @ts-expect-error 顶层 hidden 为约定字段
        hidden: true
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes
})

// Track dynamic route names for cleanup
const dynamicRouteNames: string[] = []

export function addDynamicRoute(route: RouteRecordRaw) {
  router.addRoute('layout', route)
  if (route.name) dynamicRouteNames.push(route.name as string)
}

export function resetRouter() {
  dynamicRouteNames.forEach(name => {
    if (router.hasRoute(name)) {
      router.removeRoute(name)
    }
  })
  dynamicRouteNames.length = 0
  // 移除 catch-all 404 路由
  if (router.hasRoute('CatchAll404')) {
    router.removeRoute('CatchAll404')
  }
}

export default router
