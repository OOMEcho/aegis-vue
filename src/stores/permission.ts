import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'
import type { Component } from 'vue'
import type { RouteItem, UserInfo } from '@/types/store'
import ParentView from '@/components/ParentView/index.vue'

const viewModules = import.meta.glob<{ default: Component }>('@/views/**/index.vue')

const DASHBOARD_PATH = '/dashboard'
const DASHBOARD_MENU: RouteItem = {
  path: DASHBOARD_PATH,
  name: 'Dashboard',
  title: '首页',
  icon: 'icon-pingtaizijiankong',
  hidden: false
}

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [] as RouteItem[],
    permissions: [] as string[]
  }),
  actions: {
    generateRoutes(userInfo: UserInfo): RouteRecordRaw[] {
      const routerVoList = userInfo?.routerVoList || []
      const permissions = userInfo?.permissions || []
      const accessedRoutes = buildRoutes(routerVoList)
      const menuRoutes = ensureDashboardFirst(routerVoList)
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

function ensureDashboardFirst(routes: RouteItem[] = []): RouteItem[] {
  const list = Array.isArray(routes) ? routes.slice() : []
  const dashboardIndex = list.findIndex(route => normalizePath(route.path) === DASHBOARD_PATH)
  const dashboardRoute = dashboardIndex > -1
    ? createDashboardMenu(list.splice(dashboardIndex, 1)[0])
    : createDashboardMenu()
  return [dashboardRoute, ...list]
}

function createDashboardMenu(route?: RouteItem): RouteItem {
  if (!route) {
    return { ...DASHBOARD_MENU }
  }
  return {
    ...route,
    path: DASHBOARD_PATH,
    name: 'Dashboard',
    title: DASHBOARD_MENU.title,
    icon: DASHBOARD_MENU.icon,
    hidden: false
  }
}

function buildRoutes(routes: RouteItem[] = []): RouteRecordRaw[] {
  return routes.map(route => {
    const path = normalizePath(route.path)
    const hasChildren = route.children && route.children.length > 0
    const icon = route.icon && route.icon !== '#' ? route.icon : ''
    const tmp: RouteRecordRaw = {
      path,
      name: route.name,
      component: hasChildren ? ParentView : loadView(path),
      meta: {
        title: route.title,
        icon
      },
      children: undefined as unknown as RouteRecordRaw[]
    }

    if (route.hidden) {
      tmp.meta!.hidden = true
    }

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
