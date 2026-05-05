import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'
import type { Component } from 'vue'
import type { RouteItem, UserInfo } from '@/types/store'
import ParentView from '@/components/ParentView/index.vue'

const viewModules = import.meta.glob<{ default: Component }>('@/views/**/index.vue')

const DASHBOARD_PATH = '/dashboard'
// 与 Vue2 menu 形状保持一致：title/icon 在 meta 内，hidden 放路由顶层
const DASHBOARD_MENU = {
  path: DASHBOARD_PATH,
  name: 'Dashboard',
  meta: {
    title: '首页',
    icon: 'icon-pingtaizijiankong'
  },
  hidden: false
} as unknown as RouteRecordRaw

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    // 与 Vue2 一致：保存 buildRoutes 后的菜单形状（meta.title / meta.icon / hidden）
    routes: [] as RouteRecordRaw[],
    permissions: [] as string[]
  }),
  actions: {
    generateRoutes(userInfo: UserInfo): RouteRecordRaw[] {
      const routerVoList = userInfo?.routerVoList || []
      const permissions = userInfo?.permissions || []
      const accessedRoutes = buildRoutes(routerVoList)
      const menuRoutes = ensureDashboardFirst(accessedRoutes)
      this.routes = menuRoutes
      this.permissions = permissions || []
      return accessedRoutes
    },
    reset() {
      this.routes = []
      this.permissions = []
    }
  }
})

function ensureDashboardFirst(routes: RouteRecordRaw[] = []): RouteRecordRaw[] {
  const list = Array.isArray(routes) ? routes.slice() : []
  const dashboardIndex = list.findIndex(route => normalizePath(route.path) === DASHBOARD_PATH)
  const dashboardRoute = dashboardIndex > -1
    ? createDashboardMenu(list.splice(dashboardIndex, 1)[0])
    : createDashboardMenu()
  return [dashboardRoute, ...list]
}

function createDashboardMenu(route?: RouteRecordRaw): RouteRecordRaw {
  if (!route) {
    return { ...DASHBOARD_MENU } as RouteRecordRaw
  }
  return {
    ...route,
    path: DASHBOARD_PATH,
    name: 'Dashboard',
    meta: {
      ...(route.meta || {}),
      title: '首页',
      icon: 'icon-pingtaizijiankong'
    },
    // @ts-expect-error 与 Vue2 行为对齐：hidden 放在路由顶层供 Aside 过滤
    hidden: false
  } as RouteRecordRaw
}

function buildRoutes(routes: RouteItem[] = []): RouteRecordRaw[] {
  return routes.map(route => {
    const path = normalizePath(route.path)
    const hasChildren = route.children && route.children.length > 0
    const icon = route.icon && route.icon !== '#' ? route.icon : ''
    const tmp: RouteRecordRaw = {
      path,
      name: route.name,
      // 目录节点使用 ParentView，叶子节点按约定路径加载页面
      component: hasChildren ? ParentView : loadView(path),
      meta: {
        title: route.title,
        icon
      },
      children: undefined as unknown as RouteRecordRaw[]
    }

    // 与 Vue2 一致：hidden 字段放路由顶层（SidebarItem 按 item.hidden 过滤）
    // @ts-expect-error 顶层 hidden 为约定字段
    tmp.hidden = !!route.hidden

    if (hasChildren) {
      tmp.children = buildRoutes(route.children!)
      if (tmp.children.length > 0) {
        tmp.redirect = tmp.children[0].path
      }
    }

    return tmp
  })
}

function normalizePath(path: string): string {
  if (!path) return '/'
  return path.startsWith('/') ? path : `/${path}`
}

function loadView(path: string) {
  const viewPath = path.replace(/\/$/, '')
  const modulePath = `/src/views${viewPath}/index.vue`
  const matched = viewModules[modulePath]
  if (matched) return matched
  return () => import('@/views/404/index.vue')
}
