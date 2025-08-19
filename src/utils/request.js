import axios from "axios";
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import {Message, MessageBox} from 'element-ui'

const instance = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '' : '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    'Accept': 'application/json'
  }
});

instance.interceptors.request.use(config => {
  NProgress.start()
  if (config.method.toLowerCase() === 'get') {
    config.params = {
      ...(config.params || {}),
      _t: Date.now()
    }
  }
  const token = sessionStorage.getItem('accessToken') || ''
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token
  }
  return config
}, error => {
  NProgress.done()
  return Promise.reject(error);
})

instance.interceptors.response.use(response => {
  const data = response.data
  const code = response.data.code
  const message = response.data.message
  if (code !== 200) {
    Message.error(message || '网络错误')
  }
  NProgress.done()
  return data;
}, error => {
  NProgress.done()
  Message.error(error.message || '网络错误')
  return Promise.reject(error);
})


export const getRequest = (url, params) => {
  return instance({
    method: 'GET',
    url: `${url}`,
    params: params
  })
}

export const postRequest = (url, params) => {
  return instance({
    method: 'POST',
    url: `${url}`,
    data: params
  })
}
