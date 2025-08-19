import axios from "axios";
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

const instance = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    'Accept': 'application/json'
  }
});

instance.interceptors.request.use(config => {
  NProgress.start()
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token
  }
  return config
}, error => {
  NProgress.done()
  return Promise.reject(error);
})

instance.interceptors.response.use(response => {
  NProgress.done()
  return response.data;
}, error => {
  NProgress.done()
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
    data: params,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
