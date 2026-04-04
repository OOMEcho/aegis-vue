import { defineStore } from 'pinia'
import { getUserInfo } from '@/api/profile'
import type { UserInfo } from '@/types/store'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: sessionStorage.getItem('accessToken') || '',
    userInfo: null as UserInfo | null
  }),
  actions: {
    saveToken(token: string) {
      this.accessToken = token
      sessionStorage.setItem('accessToken', token)
    },
    clearToken() {
      this.accessToken = ''
      sessionStorage.removeItem('accessToken')
      this.userInfo = null
    },
    async fetchUserInfo(force = false): Promise<UserInfo> {
      if (this.userInfo && !force) return this.userInfo
      const userInfo = await getUserInfo() as UserInfo
      this.userInfo = userInfo
      return userInfo
    }
  }
})
