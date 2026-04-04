import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import router from './index'
import { addDynamicRoute, resetRouter } from './index'
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permission'
import { useTagsViewStore } from '@/stores/tagsView'
import type { RouteLocationNormalized } from 'vue-router'

let is404Added = false

function resolvePageTitle(to: RouteLocationNormalized): string {
  const matched = Array.isArray(to?.matched) ? [...to.matched].reverse() : []
  const routeRecord = matched.find(item => item.meta?.title)
  if (routeRecord?.meta?.title) return routeRecord.meta.title as string
  if (to?.meta?.title) return to.meta.title as string
  return import.meta.env.VITE_APP_TITLE || 'aegis'
}

router.beforeEach(async (to, from, next) => {
  NProgress.start()

  const authStore = useAuthStore()
  const permissionStore = usePermissionStore()
  const accessToken = sessionStorage.getItem('accessToken')

  if (accessToken) {
    if (to.path === '/login' || to.path === '/register') {
      next({ path: '/' })
      NProgress.done()
    } else {
      const hasRoutes = permissionStore.routes.length > 0

      if (hasRoutes) {
        next()
      } else {
        try {
          const userInfo = await authStore.fetchUserInfo()
          const accessRoutes = permissionStore.generateRoutes(userInfo)

          accessRoutes.forEach(route => {
            addDynamicRoute(route)
          })

          if (!is404Added) {
            router.addRoute({
              path: '/:pathMatch(.*)*',
              name: 'CatchAll404',
              redirect: '/404'
            })
            is404Added = true
          }

          next({ ...to, replace: true })
        } catch (error) {
          console.error('获取路由失败', error)
          authStore.clearToken()
          permissionStore.reset()
          resetRouter()
          is404Added = false
          next('/login')
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
  if (typeof document !== 'undefined') {
    document.title = resolvePageTitle(to)
  }

  if (to.path !== '/login' && to.path !== '/register' && to.path !== '/404') {
    if (to.meta?.title) {
      const tagsViewStore = useTagsViewStore()
      tagsViewStore.addView({
        name: to.name as string,
        path: to.path,
        fullPath: to.fullPath,
        meta: to.meta as Record<string, unknown>,
        title: to.meta.title as string
      })
    }
  }
  NProgress.done()
})

export function setupRouter() {
  // Guard is set up by importing this module
}
