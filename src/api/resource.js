import {getRequest, postRequest, putRequest, deleteRequest} from "@/utils/request"

/**
 * 资源分页列表
 * @param {Object} params 查询参数
 * @param {number} params.pageNum 页数
 * @param {number} params.pageSize 当前页大小
 * @param {string} params.requestMethod 请求方法(GET/POST/PUT/DELETE/ALL)
 * @param {string} params.requestUri URI匹配模式
 * @param {string} params.permCode 关联权限编码
 * @param {string} params.status 状态(0-正常,1-停用)
 */
export function getResourcePageList(params) {
  return getRequest('/resources/pageList', params)
}

/**
 * 资源详情
 * @param {number} id 资源ID
 */
export function getResourceDetail(id) {
  return getRequest(`/resources/detail/${id}`)
}

/**
 * 新增资源
 * @param {Object} data 资源数据
 * @param {string} data.requestMethod 请求方法(GET/POST/PUT/DELETE/ALL)
 * @param {string} data.requestUri URI匹配模式
 * @param {string} data.permCode 关联权限编码
 * @param {string} data.status 状态(0-正常,1-停用)
 * @param {string} data.remark 备注
 */
export function addResource(data) {
  return postRequest('/resources/add', data)
}

/**
 * 修改资源
 * @param {Object} data 资源数据
 * @param {number} data.id 资源ID
 */
export function updateResource(data) {
  return putRequest('/resources/update', data)
}

/**
 * 删除资源
 * @param {number} id 资源ID
 */
export function deleteResource(id) {
  return deleteRequest(`/resources/delete/${id}`)
}
