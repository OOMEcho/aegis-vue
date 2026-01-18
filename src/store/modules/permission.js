import ParentView from '@/components/ParentView/index.vue'

const state = {
  routes: [],
  addRoutes: [],
  permissions: []
}

const mutations = {
  SET_ROUTES(state, routes) {
    state.addRoutes = routes
    state.routes = routes
  },
  SET_PERMISSIONS(state, permissions) {
    state.permissions = permissions || []
  }
}

const actions = {
  generateRoutes({ commit }, userInfo) {
    const routerVoList = userInfo?.routerVoList || []
    const permissions = userInfo?.permissions || []
    const accessedRoutes = buildRoutes(routerVoList)
    commit('SET_ROUTES', accessedRoutes)
    commit('SET_PERMISSIONS', permissions)
    return accessedRoutes
  }
}

function buildRoutes(routes = []) {
  return routes.map(route => {
    const path = normalizePath(route.path)
    const hasChildren = route.children && route.children.length > 0
    const tmp = {
      path,
      name: route.name,
      // 目录节点使用 ParentView，叶子节点按约定路径加载页面
      component: hasChildren ? ParentView : loadView(path),
      meta: {
        title: route.title,
        icon: route.icon
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
  // 路由 path 与 views 目录结构保持一致
  return () => import(`@/views${viewPath}/index.vue`)
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
