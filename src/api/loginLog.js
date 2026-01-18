import {getRequest} from "@/utils/request"

/**
 * 导出登录日志
 * @param {Object} params 查询参数
 * @param {string} params.beginTime 开始时间
 * @param {string} params.endTime 结束时间
 * @param {string} params.loginLocal 登录地址
 * @param {string} params.loginStatus 状态
 * @param {string} params.loginUsername 登录名
 * @param {number} params.pageNum 页数
 * @param {number} params.pageSize 当前页大小
 * @param {string} params.sortField 排序字段
 * @param {string} params.sortOrder 排序方式 ASC DESC
 */
export function exportLoginLog(params) {
  return getRequest('/loginLog/export', params, {responseType: 'blob'})
}

/**
 * 分页列表
 * @param {Object} params 查询参数
 * @param {string} params.beginTime 开始时间
 * @param {string} params.endTime 结束时间
 * @param {string} params.loginLocal 登录地址
 * @param {string} params.loginStatus 状态
 * @param {string} params.loginUsername 登录名
 * @param {number} params.pageNum 页数
 * @param {number} params.pageSize 当前页大小
 * @param {string} params.sortField 排序字段
 * @param {string} params.sortOrder 排序方式 ASC DESC
 */
export function getLoginLogPageList(params) {
  return getRequest('/loginLog/pageList', params)
}
