const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES(state, routes) {
    state.addRoutes = routes
    state.routes = routes
  }
}

const actions = {
  generateRoutes({ commit }, asyncRoutes) {
    const accessedRoutes = filterAsyncRoutes(asyncRoutes)
    commit('SET_ROUTES', accessedRoutes)
    return accessedRoutes
  }
}

// 后端返回的路由转换为前端可用格式
function filterAsyncRoutes(routes) {
  return routes.map(route => {
    const tmp = { ...route }

    if (tmp.component === 'Layout') {
      tmp.component = () => import('@/components/Layout/index.vue')
    } else if (tmp.component) {
      tmp.component = loadView(tmp.component)
    }

    if (tmp.children?.length) {
      tmp.children = filterAsyncRoutes(tmp.children)
    }

    return tmp
  })
}

// 动态加载组件
function loadView(view) {
  return () => import(`@/views/${view}.vue`)
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
