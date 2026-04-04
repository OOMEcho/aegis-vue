import { getRequest, postRequest, putRequest, deleteRequest } from '@/utils/request'

export function addMenu(data: Record<string, unknown>) {
  return postRequest('/menu/add', data)
}

export function deleteMenu(id: number) {
  return deleteRequest(`/menu/delete/${id}`)
}

export function getMenuDetail(id: number) {
  return getRequest(`/menu/detail/${id}`)
}

export function getMenuList(params?: Record<string, unknown>) {
  return getRequest('/menu/list', params)
}

export function getMenuPermissions(id: number) {
  return getRequest(`/menu/${id}/permissions`)
}

export function assignMenuPermissions(id: number, permCodes: string[]) {
  return postRequest(`/menu/${id}/permissions`, permCodes)
}

export function updateMenu(data: Record<string, unknown>) {
  return putRequest('/menu/update', data)
}
