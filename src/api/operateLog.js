import {getRequest} from "@/utils/request"

/**
 * 导出操作日志
 * @param {Object} params 查询参数
 * @param {string} params.beginTime 开始时间
 * @param {number} params.businessType 操作类型
 * @param {string} params.endTime 结束时间
 * @param {string} params.moduleTitle 模块标题
 * @param {string} params.operateStatus 状态
 * @param {string} params.operateUser 操作人员
 * @param {number} params.pageNum 页数
 * @param {number} params.pageSize 当前页大小
 * @param {string} params.sortField 排序字段
 * @param {string} params.sortOrder 排序方式 ASC DESC
 */
export function exportOperateLog(params) {
  return getRequest('/operateLog/export', params, {responseType: 'blob'})
}

/**
 * 分页列表
 * @param {Object} params 查询参数
 * @param {string} params.beginTime 开始时间
 * @param {number} params.businessType 操作类型
 * @param {string} params.endTime 结束时间
 * @param {string} params.moduleTitle 模块标题
 * @param {string} params.operateStatus 状态
 * @param {string} params.operateUser 操作人员
 * @param {number} params.pageNum 页数
 * @param {number} params.pageSize 当前页大小
 * @param {string} params.sortField 排序字段
 * @param {string} params.sortOrder 排序方式 ASC DESC
 */
export function getOperateLogPageList(params) {
  return getRequest('/operateLog/pageList', params)
}
