import {getRequest, postRequest, putRequest, deleteRequest} from "@/utils/request"

/**
 * 权限分页列表
 * @param {Object} params 查询参数
 * @param {number} params.pageNum 页数
 * @param {number} params.pageSize 当前页大小
 * @param {string} params.permCode 权限编码
 * @param {string} params.permName 权限名称
 * @param {string} params.permType 权限类型(M=页面,B=按钮,A=API)
 * @param {string} params.status 状态(0-正常,1-停用)
 */
export function getPermissionPageList(params) {
  return getRequest('/permissions/pageList', params)
}

/**
 * 权限列表
 * @param {Object} params 查询参数
 */
export function getPermissionList(params) {
  return getRequest('/permissions/list', params)
}

/**
 * 新增权限
 * @param {Object} data 权限数据
 * @param {string} data.permCode 权限编码
 * @param {string} data.permName 权限名称
 * @param {string} data.permType 权限类型(M=页面,B=按钮,A=API)
 * @param {string} data.status 状态(0-正常,1-停用)
 * @param {string} data.remark 备注
 */
export function addPermission(data) {
  return postRequest('/permissions/add', data)
}

/**
 * 修改权限
 * @param {Object} data 权限数据
 * @param {number} data.id 权限ID
 */
export function updatePermission(data) {
  return putRequest('/permissions/update', data)
}

/**
 * 修改权限状态
 * @param {number} id 权限ID
 */
export function effectivePermission(id) {
  return deleteRequest(`/permissions/effective/${id}`)
}
