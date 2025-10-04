import {getRequest, postRequest, putRequest, deleteRequest} from "@/api/index"

/**
 * 新增通知
 * @param {Object} data 通知数据
 * @param {number} data.id 主键ID
 * @param {string} data.noticeContent 通知内容
 * @param {string} data.noticeTitle 通知标题
 * @param {string} data.noticeType 通知类型(1=系统通知,2=公告,3=提醒)
 * @param {number} data.pageNum 页数
 * @param {number} data.pageSize 当前页大小
 * @param {string} data.publishTime 计划发布时间,为空则立即发布
 * @param {string} data.sortField 排序字段
 * @param {string} data.sortOrder 排序方式 ASC DESC
 * @param {string} data.status 通知状态(0=待发布,1=已发布,2=已撤回)
 * @param {Array} data.targetIds 目标对象ID列表
 * @param {number} data.targetType 目标类型(1=全部用户,2=指定用户,3=指定角色,4=指定部门)
 */
export function addNotice(data) {
  return postRequest('/notice/add', data)
}

/**
 * 删除通知
 * @param {number} id 通知ID
 */
export function deleteNotice(id) {
  return deleteRequest(`/notice/delete/${id}`)
}

/**
 * 通知详情
 * @param {number} id 通知ID
 */
export function getNoticeDetail(id) {
  return getRequest(`/notice/detail/${id}`)
}

/**
 * 通知分页列表
 * @param {Object} params 查询参数
 * @param {number} params.id 主键ID
 * @param {string} params.noticeContent 通知内容
 * @param {string} params.noticeTitle 通知标题
 * @param {string} params.noticeType 通知类型(1=系统通知,2=公告,3=提醒)
 * @param {number} params.pageNum 页数
 * @param {number} params.pageSize 当前页大小
 * @param {string} params.publishTime 计划发布时间,为空则立即发布
 * @param {string} params.sortField 排序字段
 * @param {string} params.sortOrder 排序方式 ASC DESC
 * @param {string} params.status 通知状态(0=待发布,1=已发布,2=已撤回)
 * @param {Array} params.targetIds 目标对象ID列表
 * @param {number} params.targetType 目标类型(1=全部用户,2=指定用户,3=指定角色,4=指定部门)
 */
export function getNoticePageList(params) {
  return getRequest('/notice/pageList', params)
}

/**
 * 发布通知
 * @param {number} id 通知ID
 */
export function publishNotice(id) {
  return getRequest(`/notice/publish/${id}`)
}

/**
 * 撤销通知
 * @param {number} id 通知ID
 */
export function revokeNotice(id) {
  return getRequest(`/notice/revoke/${id}`)
}

/**
 * 修改通知
 * @param {Object} data 通知数据
 * @param {number} data.id 主键ID
 * @param {string} data.noticeContent 通知内容
 * @param {string} data.noticeTitle 通知标题
 * @param {string} data.noticeType 通知类型(1=系统通知,2=公告,3=提醒)
 * @param {number} data.pageNum 页数
 * @param {number} data.pageSize 当前页大小
 * @param {string} data.publishTime 计划发布时间,为空则立即发布
 * @param {string} data.sortField 排序字段
 * @param {string} data.sortOrder 排序方式 ASC DESC
 * @param {string} data.status 通知状态(0=待发布,1=已发布,2=已撤回)
 * @param {Array} data.targetIds 目标对象ID列表
 * @param {number} data.targetType 目标类型(1=全部用户,2=指定用户,3=指定角色,4=指定部门)
 */
export function updateNotice(data) {
  return putRequest('/notice/update', data)
}

// ========== 通知用户接口 ==========

/**
 * 用户通知详情
 * @param {number} id 通知ID
 */
export function getUserNoticeDetail(id) {
  return getRequest(`/notice/user/detail/${id}`)
}

/**
 * 用户通知分页列表
 * @param {Object} params 查询参数
 * @param {string} params.noticeTitle 通知标题
 * @param {string} params.noticeType 通知类型(1=系统通知,2=公告,3=提醒)
 * @param {number} params.pageNum 页数
 * @param {number} params.pageSize 当前页大小
 * @param {number} params.readFlag 是否已读(0=未读,1=已读)
 * @param {string} params.sortField 排序字段
 * @param {string} params.sortOrder 排序方式 ASC DESC
 */
export function getUserNoticePageList(params) {
  return getRequest('/notice/user/pageList', params)
}

/**
 * 获取未读消息数
 */
export function getUnreadCount() {
  return getRequest('/notice/user/unreadCount')
}
