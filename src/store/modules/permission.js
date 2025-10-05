const state = {
  routes: [],
  addRoutes: [],
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = routes
  }
}

const actions = {
  generateRoutes({ commit }, asyncRoutes) {
    return new Promise(resolve => {
      const accessedRoutes = filterAsyncRoutes(asyncRoutes)
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

// 后端返回的路由转换成前端可用的路由格式
function filterAsyncRoutes(routes) {
  const res = []
  routes.forEach(route => {
    const tmp = { ...route }

    // component 字符串转换为实际组件
    if (tmp.component === 'Layout') {
      tmp.component = () => import('@/components/Layout/index.vue')
    } else if (tmp.component) {
      tmp.component = loadView(tmp.component)
    }

    if (tmp.children) {
      tmp.children = filterAsyncRoutes(tmp.children)
    }
    res.push(tmp)
  })
  return res
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
