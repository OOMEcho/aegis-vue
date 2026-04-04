import { getRequest, postRequest, putRequest } from '@/utils/request'

export function getPermissionPageList(params: Record<string, unknown>) {
  return getRequest('/permissions/pageList', params)
}

export function getPermissionList(params?: Record<string, unknown>) {
  return getRequest('/permissions/list', params)
}

export function addPermission(data: Record<string, unknown>) {
  return postRequest('/permissions/add', data)
}

export function updatePermission(data: Record<string, unknown>) {
  return putRequest('/permissions/update', data)
}

export function effectivePermission(id: number) {
  return putRequest(`/permissions/effective/${id}`)
}
