import {getRequest, postRequest, putRequest, deleteRequest} from "@/api/index"

/**
 * 新增用户
 * @param {Object} data 用户数据
 * @param {string} data.beginTime 开始时间
 * @param {number} data.deptId 部门ID
 * @param {string} data.email 邮箱
 * @param {string} data.endTime 结束时间
 * @param {number} data.id 主键ID
 * @param {string} data.nickname 呢称
 * @param {number} data.pageNum 页数
 * @param {number} data.pageSize 当前页大小
 * @param {string} data.phone 电话
 * @param {Array} data.roleIds 角色列表
 * @param {string} data.sex 性别
 * @param {string} data.sortField 排序字段
 * @param {string} data.sortOrder 排序方式 ASC DESC
 * @param {string} data.status 状态
 * @param {string} data.username 用户名
 */
export function addUser(data) {
  return postRequest('/user/add', data)
}

/**
 * 删除用户
 * @param {number} id 用户ID
 */
export function deleteUser(id) {
  return deleteRequest(`/user/delete/${id}`)
}

/**
 * 用户详情
 * @param {number} id 用户ID
 */
export function getUserDetail(id) {
  return getRequest(`/user/detail/${id}`)
}

/**
 * 分页查询用户列表
 * @param {Object} params 查询参数
 * @param {string} params.beginTime 开始时间
 * @param {number} params.deptId 部门ID
 * @param {string} params.email 邮箱
 * @param {string} params.endTime 结束时间
 * @param {number} params.id 主键ID
 * @param {string} params.nickname 呢称
 * @param {number} params.pageNum 页数
 * @param {number} params.pageSize 当前页大小
 * @param {string} params.phone 电话
 * @param {Array} params.roleIds 角色列表
 * @param {string} params.sex 性别
 * @param {string} params.sortField 排序字段
 * @param {string} params.sortOrder 排序方式 ASC DESC
 * @param {string} params.status 状态
 * @param {string} params.username 用户名
 */
export function getUserPageList(params) {
  return getRequest('/user/pageList', params)
}

/**
 * 重置用户密码
 * @param {number} id 用户ID
 */
export function resetUserPassword(id) {
  return putRequest(`/user/resetPassword/${id}`)
}

/**
 * 修改用户
 * @param {Object} data 用户数据
 * @param {string} data.beginTime 开始时间
 * @param {number} data.deptId 部门ID
 * @param {string} data.email 邮箱
 * @param {string} data.endTime 结束时间
 * @param {number} data.id 主键ID
 * @param {string} data.nickname 呢称
 * @param {number} data.pageNum 页数
 * @param {number} data.pageSize 当前页大小
 * @param {string} data.phone 电话
 * @param {Array} data.roleIds 角色列表
 * @param {string} data.sex 性别
 * @param {string} data.sortField 排序字段
 * @param {string} data.sortOrder 排序方式 ASC DESC
 * @param {string} data.status 状态
 * @param {string} data.username 用户名
 */
export function updateUser(data) {
  return putRequest('/user/update', data)
}

/**
 * 修改用户状态
 * @param {number} id 用户ID
 */
export function updateUserStatus(id) {
  return putRequest(`/user/updateStatus/${id}`)
}
