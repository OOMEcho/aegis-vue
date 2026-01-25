const noCacheList = ['/log/login', '/log/operate', '/file', '/profile', '/system/menu']

const state = {
  visitedViews: [],
  cachedViews: [],
  viewKey: 0
}

const mutations = {
  ADD_VISITED_VIEW(state, view) {
    if (state.visitedViews.some(v => v.path === view.path)) return
    state.visitedViews.push({
      name: view.name,
      path: view.path,
      fullPath: view.fullPath || view.path,
      meta: view.meta || {},
      title: (view.meta && view.meta.title) || view.name
    })
    this.commit('tagsView/SORT_VISITED_VIEWS')
  },
  ADD_CACHED_VIEW(state, view) {
    if (!view.name) return
    if (state.cachedViews.includes(view.name)) return
    if ((view.meta && view.meta.noCache) || noCacheList.includes(view.path)) return
    state.cachedViews.push(view.name)
  },
  DEL_VISITED_VIEW(state, view) {
    state.visitedViews = state.visitedViews.filter(v => v.path !== view.path)
    this.commit('tagsView/SORT_VISITED_VIEWS')
  },
  DEL_CACHED_VIEW(state, view) {
    state.cachedViews = state.cachedViews.filter(name => name !== view.name)
  },
  DEL_OTHERS_VISITED(state, view) {
    state.visitedViews = state.visitedViews.filter(v => v.meta && v.meta.affix || v.path === view.path)
    this.commit('tagsView/SORT_VISITED_VIEWS')
  },
  DEL_OTHERS_CACHED(state, view) {
    state.cachedViews = state.cachedViews.filter(name => name === view.name)
  },
  DEL_ALL_VISITED(state) {
    state.visitedViews = state.visitedViews.filter(v => v.meta && v.meta.affix)
    this.commit('tagsView/SORT_VISITED_VIEWS')
  },
  SORT_VISITED_VIEWS(state) {
    const affixViews = state.visitedViews.filter(v => v.meta && v.meta.affix)
    const normalViews = state.visitedViews.filter(v => !v.meta || !v.meta.affix)
    state.visitedViews = [...affixViews, ...normalViews]
  },
  DEL_ALL_CACHED(state) {
    state.cachedViews = []
  },
  INCREMENT_VIEW_KEY(state) {
    state.viewKey += 1
  }
}

const actions = {
  addView({dispatch}, view) {
    dispatch('addVisitedView', view)
    dispatch('addCachedView', view)
  },
  addVisitedView({commit}, view) {
    commit('ADD_VISITED_VIEW', view)
  },
  addCachedView({commit}, view) {
    commit('ADD_CACHED_VIEW', view)
  },
  delView({dispatch}, view) {
    dispatch('delVisitedView', view)
    dispatch('delCachedView', view)
  },
  delVisitedView({commit}, view) {
    commit('DEL_VISITED_VIEW', view)
  },
  delCachedView({commit}, view) {
    commit('DEL_CACHED_VIEW', view)
  },
  delOthers({commit, dispatch}, view) {
    commit('DEL_OTHERS_VISITED', view)
    dispatch('delOthersCached', view)
  },
  delOthersCached({commit}, view) {
    commit('DEL_OTHERS_CACHED', view)
  },
  delAll({commit}) {
    commit('DEL_ALL_VISITED')
    commit('DEL_ALL_CACHED')
  },
  refreshView({commit, dispatch}, view) {
    return new Promise(resolve => {
      dispatch('delCachedView', view)
      commit('INCREMENT_VIEW_KEY')
      dispatch('addCachedView', view)
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
