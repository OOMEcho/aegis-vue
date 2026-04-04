import axios from 'axios'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permission'
import router, { resetRouter } from '@/router'

// 基础配置
const instance = axios.create({
  baseURL: import.meta.env.PROD
    ? import.meta.env.VITE_BASE_API
    : import.meta.env.VITE_BASE_PRE,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    'Accept': 'application/json'
  },
  validateStatus: () => true
})

// ========== 刷新 Token 相关 ==========
let isRefreshing = false
let retryQueue: Array<{
  resolve: (value: any) => void
  reject: (reason?: unknown) => void
  config: any
}> = []
let hasShownLoginExpired = false
let lastErrorMessage = ''
let lastErrorTime = 0

const clearAuthState = async () => {
  const authStore = useAuthStore()
  const permissionStore = usePermissionStore()
  authStore.clearToken()
  permissionStore.reset()
  resetRouter()
}

const refreshTokenRequest = () => {
  return instance.get('/profile/refreshToken', {
    __isRefreshRequest: true
  } as any)
}

// ========== 请求拦截器 ==========
instance.interceptors.request.use(config => {
  NProgress.start()

  if (config.method === 'get') {
    config.params = { ...config.params, _t: Date.now() }
  }

  const authStore = useAuthStore()
  const token = authStore.accessToken
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  return config
}, error => {
  NProgress.done()
  return Promise.reject(error)
})

// ========== 响应拦截器 ==========
instance.interceptors.response.use(async response => {
  NProgress.done()

  if (response.config?.responseType === 'blob') {
    return response.data
  }

  const payload = response.data
  if (!payload || typeof payload !== 'object') {
    if (response.status >= 400) {
      showError('服务不可用，请稍后重试')
      return Promise.reject(new Error('服务不可用，请稍后重试'))
    }
    return payload
  }
  const { code, data, message } = payload

  if (code === 406) {
    if (!hasShownLoginExpired) {
      hasShownLoginExpired = true
      ElMessage.warning('登录已过期，请重新登录')
      await clearAuthState()
      await router.push('/login')
      setTimeout(() => { hasShownLoginExpired = false }, 3000)
    }
    return Promise.reject(new Error('登录过期'))
  }

  if (code === 401) {
    const originalRequest = response.config as any

    if (originalRequest.__isRefreshRequest) {
      if (!hasShownLoginExpired) {
        hasShownLoginExpired = true
        ElMessage.warning('登录已过期，请重新登录')
        await clearAuthState()
        await router.push('/login')
        setTimeout(() => { hasShownLoginExpired = false }, 3000)
      }
      return Promise.reject(new Error('刷新Token过期'))
    }

    if (!isRefreshing) {
      isRefreshing = true
      try {
        const newAccessToken = await refreshTokenRequest()
        if (!newAccessToken) {
          return Promise.reject(new Error('刷新 Token 失败'))
        }

        const authStore = useAuthStore()
        authStore.saveToken(newAccessToken as unknown as string)

        const latestToken = authStore.accessToken
        retryQueue.forEach(({ resolve, config }) => {
          resolve(instance({
            ...config,
            headers: {
              ...(config.headers as Record<string, string> || {}),
              Authorization: `Bearer ${latestToken}`
            }
          }))
        })
        retryQueue = []

        return instance({
          ...originalRequest,
          headers: {
            ...(originalRequest.headers as Record<string, string> || {}),
            Authorization: `Bearer ${newAccessToken}`
          }
        })
      } catch (err) {
        retryQueue.forEach(({ reject }) => reject(err))
        retryQueue = []

        if (!hasShownLoginExpired) {
          hasShownLoginExpired = true
          ElMessage.warning('登录已过期，请重新登录')
          await clearAuthState()
          await router.push('/login')
          setTimeout(() => { hasShownLoginExpired = false }, 3000)
        }
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return new Promise((resolve, reject) => {
      retryQueue.push({ resolve, reject, config: originalRequest })
    })
  }

  if (code !== 200) {
    showError(message || '网络错误')
    return Promise.reject(new Error(message || '网络错误'))
  }

  return data
}, error => {
  NProgress.done()

  const status = error?.response?.status
  if (status && status >= 400) {
    showError('服务不可用，请稍后重试')
    return Promise.reject(error)
  }

  const errorMessage = error?.message || ''
  const errorCode = error?.code || ''
  if (errorCode === 'ECONNREFUSED' || errorMessage.includes('Network Error')) {
    showError('服务不可用，请稍后重试')
    return Promise.reject(error)
  }

  showError(errorMessage || '网络错误')
  return Promise.reject(error)
})

// ========== 通用请求封装 ==========
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const request = (method: string, url: string, params?: unknown, config: Record<string, unknown> = {}): Promise<any> => {
  const options: Record<string, unknown> = { method, url, ...config }
  if (method === 'get') {
    options.params = params
  } else {
    options.data = params
  }

  if (params instanceof FormData) {
    options.headers = {
      ...(options.headers as Record<string, string> || {}),
      'Content-Type': 'multipart/form-data'
    }
  }

  // 响应拦截器已将 response.data.data 解包，实际返回业务数据而非 AxiosResponse
  return instance(options as any) as Promise<any>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getRequest = (url: string, params?: unknown, config?: Record<string, unknown>): Promise<any> =>
  request('get', url, params, config)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const postRequest = (url: string, params?: unknown, config?: Record<string, unknown>): Promise<any> =>
  request('post', url, params, config)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const putRequest = (url: string, params?: unknown, config?: Record<string, unknown>): Promise<any> =>
  request('put', url, params, config)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deleteRequest = (url: string, params?: unknown, config?: Record<string, unknown>): Promise<any> =>
  request('delete', url, params, config)

function showError(message: string) {
  const now = Date.now()
  if (message === lastErrorMessage && now - lastErrorTime < 2000) return
  lastErrorMessage = message
  lastErrorTime = now
  ElMessage.error(message)
}
