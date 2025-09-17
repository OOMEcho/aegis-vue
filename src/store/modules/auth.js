const state = {
  accessToken: sessionStorage.getItem('accessToken') || ''
}

const mutations = {
  SET_TOKEN(state, token) {
    state.accessToken = token
    sessionStorage.setItem('accessToken', token)
  },
  CLEAR_TOKEN(state) {
    state.accessToken = ''
    sessionStorage.removeItem('accessToken')
  }
}

const actions = {
  saveToken({commit}, token) {
    commit('SET_TOKEN', token)
  },
  clearToken({commit}) {
    commit('CLEAR_TOKEN')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
