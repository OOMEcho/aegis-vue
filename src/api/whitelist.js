import {getRequest, postRequest, putRequest, deleteRequest} from "@/api/index"

/**
 * 新增白名单
 * @param {Object} data 白名单数据
 * @param {string} data.description 描述
 * @param {number} data.id 主键ID
 * @param {number} data.pageNum 页数
 * @param {number} data.pageSize 当前页大小
 * @param {string} data.requestMethod 请求方法,GET,POST,PUT,DELETE,ALL=不限制
 * @param {string} data.requestUri URL匹配模式
 * @param {string} data.sortField 排序字段
 * @param {string} data.sortOrder 排序方式 ASC DESC
 * @param {string} data.status 状态(0-正常,1停用)
 */
export function addWhitelist(data) {
  return postRequest('/whitelist/add', data)
}

/**
 * 删除白名单
 * @param {number} id 白名单ID
 */
export function deleteWhitelist(id) {
  return deleteRequest(`/whitelist/delete/${id}`)
}

/**
 * 白名单详情
 * @param {number} id 白名单ID
 */
export function getWhitelistDetail(id) {
  return getRequest(`/whitelist/detail/${id}`)
}

/**
 * 分页列表
 * @param {Object} params 查询参数
 * @param {string} params.description 描述
 * @param {number} params.id 主键ID
 * @param {number} params.pageNum 页数
 * @param {number} params.pageSize 当前页大小
 * @param {string} params.requestMethod 请求方法,GET,POST,PUT,DELETE,ALL=不限制
 * @param {string} params.requestUri URL匹配模式
 * @param {string} params.sortField 排序字段
 * @param {string} params.sortOrder 排序方式 ASC DESC
 * @param {string} params.status 状态(0-正常,1停用)
 */
export function getWhitelistPageList(params) {
  return getRequest('/whitelist/pageList', params)
}

/**
 * 修改白名单
 * @param {Object} data 白名单数据
 * @param {string} data.description 描述
 * @param {number} data.id 主键ID
 * @param {number} data.pageNum 页数
 * @param {number} data.pageSize 当前页大小
 * @param {string} data.requestMethod 请求方法,GET,POST,PUT,DELETE,ALL=不限制
 * @param {string} data.requestUri URL匹配模式
 * @param {string} data.sortField 排序字段
 * @param {string} data.sortOrder 排序方式 ASC DESC
 * @param {string} data.status 状态(0-正常,1停用)
 */
export function updateWhitelist(data) {
  return putRequest('/whitelist/update', data)
}
