import axios from 'axios'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import {Message} from 'element-ui'
import store from '@/store'
import router from '@/router'

// 基础配置
const instance = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '' : '/api',
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
let retryQueue = []
// 全局变量，控制是否已提示过登录过期
let hasShownLoginExpired = false

const refreshTokenRequest = () => {
  return instance.get('/profile/refreshToken', {})
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

  const {code, data, message} = response.data

  if (code === 406) {
    if (!hasShownLoginExpired) {
      hasShownLoginExpired = true
      Message.warning('登录已过期，请重新登录')

      // 清理登录状态
      await store.dispatch('auth/clearToken')
      await router.push('/')

      // 一段时间后解锁
      setTimeout(() => {
        hasShownLoginExpired = false
      }, 3000)
    }
    return Promise.reject(new Error('登录过期'))
  }

  if (code === 401) {
    const originalRequest = response.config

    if (!isRefreshing) {
      isRefreshing = true
      try {
        const newAccessToken = await refreshTokenRequest()
        if (!newAccessToken) {
          return Promise.reject(new Error('刷新 Token 失败'))
        }

        await store.dispatch('auth/saveToken', newAccessToken)

        // 重新执行等待队列中的请求
        retryQueue.forEach(cb => cb())
        retryQueue = []

        return instance({
          ...originalRequest,
          headers: {
            ...originalRequest.headers,
            Authorization: `Bearer ${newAccessToken}`
          }
        })
      } catch (err) {
        retryQueue.forEach(cb => cb(null))
        retryQueue = []

        await store.dispatch('auth/clearToken')
        Message.warning('登录已过期，请重新登录')
        await router.push('/login')

        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return new Promise(resolve => {
      retryQueue.push(() => {
        const latestToken = store.state.auth.accessToken // 取最新 token
        resolve(
          instance({
            ...originalRequest,
            headers: {
              ...originalRequest.headers,
              Authorization: `Bearer ${latestToken}`
            }
          })
        )
      })
    })
  }

  if (code !== 200) {
    Message.error(message || '网络错误')
    return Promise.reject(new Error(message || '网络错误'))
  }

  return data
}, error => {
  NProgress.done()
  Message.error(error.message || '网络错误')
  return Promise.reject(error)
})

// ========== 通用请求封装 ==========
const index = (method, url, params) => {
  const options = {method, url}
  if (method === 'get') {
    options.params = params
  } else {
    options.data = params
  }
  return instance(options)
}

export const getRequest = (url, params) => index('get', url, params)
export const postRequest = (url, params) => index('post', url, params)
export const putRequest = (url, params) => index('put', url, params)
export const deleteRequest = (url, params) => index('delete', url, params)
