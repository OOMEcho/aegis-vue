import { getRequest, postRequest, putRequest, deleteRequest } from '@/utils/request'

export function addDept(data: Record<string, unknown>) {
  return postRequest('/dept/add', data)
}

export function deleteDept(id: number) {
  return deleteRequest(`/dept/delete/${id}`)
}

export function getDeptDetail(id: number) {
  return getRequest(`/dept/detail/${id}`)
}

export function getDeptListExclude(id: number) {
  return getRequest(`/dept/exclude/${id}`)
}

export function getDeptList(params?: Record<string, unknown>) {
  return getRequest('/dept/list', params)
}

export function getDeptTree(params?: Record<string, unknown>) {
  return getRequest('/dept/tree', params)
}

export function updateDept(data: Record<string, unknown>) {
  return putRequest('/dept/update', data)
}
