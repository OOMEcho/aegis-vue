import { getRequest, postRequest, putRequest, deleteRequest } from '@/utils/request'

export function addUser(data: Record<string, unknown>) {
  return postRequest('/user/add', data)
}

export function deleteUser(id: number) {
  return deleteRequest(`/user/delete/${id}`)
}

export function getUserDetail(id: number) {
  return getRequest(`/user/detail/${id}`)
}

export function getUserPageList(params: Record<string, unknown>) {
  return getRequest('/user/pageList', params)
}

export function resetUserPassword(id: number) {
  return putRequest(`/user/resetPassword/${id}`)
}

export function kickUser(id: number) {
  return putRequest(`/user/kick/${id}`)
}

export function updateUser(data: Record<string, unknown>) {
  return putRequest('/user/update', data)
}

export function updateUserStatus(id: number) {
  return putRequest(`/user/updateStatus/${id}`)
}
