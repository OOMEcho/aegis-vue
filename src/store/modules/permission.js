import ParentView from '@/components/ParentView/index.vue'

const viewModules = require.context('@/views', true, /index\.vue$/, 'lazy')

const DASHBOARD_PATH = '/dashboard'
const DASHBOARD_MENU = {
  path: DASHBOARD_PATH,
  name: 'Dashboard',
  meta: {
    title: '首页',
    icon: 'icon-pingtaizijiankong'
  },
  hidden: false
}

const state = {
  routes: [],
  permissions: []
}

const mutations = {
  SET_ROUTES(state, routes) {
    state.routes = routes
  },
  SET_PERMISSIONS(state, permissions) {
    state.permissions = permissions || []
  }
}

const actions = {
  generateRoutes({commit}, userInfo) {
    const routerVoList = userInfo?.routerVoList || []
    const permissions = userInfo?.permissions || []
    const accessedRoutes = buildRoutes(routerVoList)
    const menuRoutes = ensureDashboardFirst(accessedRoutes)
    commit('SET_ROUTES', menuRoutes)
    commit('SET_PERMISSIONS', permissions)
    return accessedRoutes
  }
}

function ensureDashboardFirst(routes = []) {
  const list = Array.isArray(routes) ? routes.slice() : []
  const dashboardIndex = list.findIndex(route => normalizePath(route.path) === DASHBOARD_PATH)
  const dashboardRoute = dashboardIndex > -1
    ? createDashboardMenu(list.splice(dashboardIndex, 1)[0])
    : createDashboardMenu()
  return [dashboardRoute, ...list]
}

function createDashboardMenu(route) {
  if (!route) {
    return {...DASHBOARD_MENU}
  }

  return {
    ...route,
    path: DASHBOARD_PATH,
    name: 'Dashboard',
    meta: {
      ...(route.meta || {}),
      title: DASHBOARD_MENU.meta.title,
      icon: DASHBOARD_MENU.meta.icon
    },
    hidden: false
  }
}

function buildRoutes(routes = []) {
  return routes.map(route => {
    const path = normalizePath(route.path)
    const hasChildren = route.children && route.children.length > 0
    const icon = route.icon && route.icon !== '#' ? route.icon : ''
    const tmp = {
      path,
      name: route.name,
      // 目录节点使用 ParentView，叶子节点按约定路径加载页面
      component: hasChildren ? ParentView : loadView(path),
      meta: {
        title: route.title,
        icon
      },
      hidden: !!route.hidden
    }

    if (hasChildren) {
      tmp.children = buildRoutes(route.children)
      if (tmp.children.length > 0) {
        tmp.redirect = tmp.children[0].path
      }
    }

    return tmp
  })
}

function normalizePath(path) {
  if (!path) {
    return '/'
  }
  return path.startsWith('/') ? path : `/${path}`
}

function loadView(path) {
  const viewPath = path.replace(/\/$/, '')
  const modulePath = `.${viewPath}/index.vue`
  // 路由 path 与 views 目录结构保持一致
  return () =>
    viewModules(modulePath)
      .then(mod => mod.default || mod)
      .catch(() => import('@/views/404/index.vue').then(mod => mod.default || mod))
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
