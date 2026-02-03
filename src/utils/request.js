import axios from 'axios'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import {Message} from 'element-ui'
import store from '@/store'
import router, {resetRouter} from '@/router'

// 基础配置
const instance = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? process.env.VUE_APP_BASE_API  // 生产环境：https://admin.example.cn（跨域请求）
    : process.env.VUE_APP_BASE_PRE,  // 开发环境：/api（代理转发）
  timeout: 15000,
  withCredentials: true, // 允许携带 cookie
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    'Accept': 'application/json'
  },
  validateStatus: () => true
})

// ========== 刷新 Token 相关 ==========
let isRefreshing = false
// 待重放的请求队列（refresh 成功后统一重放）
let retryQueue = []
// 全局变量，控制是否已提示过登录过期
let hasShownLoginExpired = false
let lastErrorMessage = ''
let lastErrorTime = 0

const clearAuthState = async () => {
  await store.dispatch('auth/clearToken')
  store.commit('permission/SET_ROUTES', [])
  store.commit('permission/SET_PERMISSIONS', [])
  resetRouter()
}

const refreshTokenRequest = () => {
  // 添加标记防止递归
  return instance.get('/profile/refreshToken', {
    __isRefreshRequest: true
  })
}

// ========== 请求拦截器 ==========
instance.interceptors.request.use(config => {
  NProgress.start()

  if (config.method === 'get') {
    config.params = {...config.params, _t: Date.now()}
  }

  const token = store.state.auth.accessToken
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

  // 文件下载场景直接返回二进制
  if (response.config && response.config.responseType === 'blob') {
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
  const {code, data, message} = payload

  if (code === 406) {
    if (!hasShownLoginExpired) {
      hasShownLoginExpired = true
      Message.warning('登录已过期，请重新登录')

      // 清理登录状态
      await clearAuthState()
      await router.push('/login')

      // 一段时间后解锁
      setTimeout(() => {
        hasShownLoginExpired = false
      }, 3000)
    }
    return Promise.reject(new Error('登录过期'))
  }

  // access token 过期，尝试刷新并重放请求
  if (code === 401) {
    const originalRequest = response.config

    // 如果是刷新接口自身返回401，直接登出
    if (originalRequest.__isRefreshRequest) {
      if (!hasShownLoginExpired) {
        hasShownLoginExpired = true
        Message.warning('登录已过期，请重新登录')
        await clearAuthState()
        await router.push('/login')
        setTimeout(() => {
          hasShownLoginExpired = false
        }, 3000)
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

        await store.dispatch('auth/saveToken', newAccessToken)

        // 正确处理队列中的请求（成功场景）
        const latestToken = store.state.auth.accessToken
        retryQueue.forEach(({resolve, config}) => {
          resolve(instance({
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${latestToken}`
            }
          }))
        })
        retryQueue = []

        // 重试当前请求
        return instance({
          ...originalRequest,
          headers: {
            ...originalRequest.headers,
            Authorization: `Bearer ${newAccessToken}`
          }
        })
      } catch (err) {
        // 正确拒绝队列中的请求（失败场景）
        retryQueue.forEach(({reject}) => reject(err))
        retryQueue = []

        if (!hasShownLoginExpired) {
          hasShownLoginExpired = true
          Message.warning('登录已过期，请重新登录')
          await clearAuthState()
          await router.push('/login')
          setTimeout(() => {
            hasShownLoginExpired = false
          }, 3000)
        }

        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    // 队列中存储 resolve、reject 和原始配置
    return new Promise((resolve, reject) => {
      retryQueue.push({
        resolve,
        reject,
        config: originalRequest
      })
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
const request = (method, url, params, config = {}) => {
  const options = {method, url, ...config}
  if (method === 'get') {
    options.params = params
  } else {
    options.data = params
  }

  if (params instanceof FormData) {
    options.headers = {
      ...(options.headers || {}),
      'Content-Type': 'multipart/form-data'
    }
  }

  return instance(options)
}

export const getRequest = (url, params, config) => request('get', url, params, config)
export const postRequest = (url, params, config) => request('post', url, params, config)
export const putRequest = (url, params, config) => request('put', url, params, config)
export const deleteRequest = (url, params, config) => request('delete', url, params, config)

function showError(message) {
  const now = Date.now()
  if (message === lastErrorMessage && now - lastErrorTime < 2000) {
    return
  }
  // 避免短时间内重复弹错
  lastErrorMessage = message
  lastErrorTime = now
  Message.error(message)
}
