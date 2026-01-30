import {getUserInfo} from '@/api/profile'

const state = {
  accessToken: sessionStorage.getItem('accessToken') || '',
  userInfo: null
}

const mutations = {
  SET_TOKEN(state, token) {
    state.accessToken = token
    sessionStorage.setItem('accessToken', token)
  },
  CLEAR_TOKEN(state) {
    state.accessToken = ''
    sessionStorage.removeItem('accessToken')
  },
  SET_USER_INFO(state, userInfo) {
    state.userInfo = userInfo
  }
}

const actions = {
  saveToken({commit}, token) {
    commit('SET_TOKEN', token)
    return token
  },
  clearToken({commit}) {
    commit('CLEAR_TOKEN')
    commit('SET_USER_INFO', null)
    return true
  },
  async fetchUserInfo({commit, state}, {force = false} = {}) {
    if (state.userInfo && !force) {
      return state.userInfo
    }
    const userInfo = await getUserInfo()
    commit('SET_USER_INFO', userInfo)
    return userInfo
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
