import axios from "axios";
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

const instance = axios.create({
  baseURL: 'http://127.0.0.1:8080',
  timeout: 5000
});

instance.interceptors.request.use(config => {
  NProgress.start()
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

export const putRequest = (url, params) => {
  return instance({
    method: 'PUT',
    url: `${url}`,
    data: params,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const deleteRequest = (url) => {
  return instance({
    method: 'DELETE',
    url: `${url}`
  })
}
