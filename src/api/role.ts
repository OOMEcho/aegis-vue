import { getRequest, postRequest, putRequest, deleteRequest } from '@/utils/request'

export function addRole(data: Record<string, unknown>) {
  return postRequest('/role/add', data)
}

export function getAllocatedList(params: Record<string, unknown>) {
  return getRequest('/role/allocatedList', params)
}

export function cancelAuth(data: Record<string, unknown>) {
  return putRequest('/role/cancel', data)
}

export function selectAuthAll(data: Record<string, unknown>) {
  return postRequest('/role/selectAll', data)
}

export function getUnallocatedList(params: Record<string, unknown>) {
  return getRequest('/role/unallocatedList', params)
}

export function cancelAuthAll(data: Record<string, unknown>) {
  return putRequest('/role/cancelAll', data)
}

export function deleteRole(id: number) {
  return deleteRequest(`/role/delete/${id}`)
}

export function getRolePageList(params: Record<string, unknown>) {
  return getRequest('/role/pageList', params)
}

export function getRoleWithDeptTree(roleId: number) {
  return getRequest(`/role/roleWithDeptTree/${roleId}`)
}

export function getRolePermissions(roleId: number) {
  return getRequest(`/role/${roleId}/permissions`)
}

export function assignRolePermissions(roleId: number, permCodes: string[]) {
  return postRequest(`/role/${roleId}/permissions`, permCodes)
}

export function updateRole(data: Record<string, unknown>) {
  return putRequest('/role/update', data)
}

export function updateRoleDataScope(data: Record<string, unknown>) {
  return putRequest('/role/updateRoleDataScope', data)
}

export function updateRoleStatus(id: number) {
  return putRequest(`/role/updateStatus/${id}`)
}
