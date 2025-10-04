import {getRequest, postRequest, putRequest, deleteRequest} from "@/api/index"

/**
 * 新增部门
 * @param {Object} data 部门数据
 * @param {string} data.deptName 部门名称
 * @param {string} data.email 邮箱
 * @param {number} data.id 主键
 * @param {string} data.leader 负责人
 * @param {number} data.orderNum 显示顺序
 * @param {number} data.parentId 父部门ID
 * @param {string} data.phone 联系电话
 * @param {string} data.status 部门状态
 */
export function addDept(data) {
  return postRequest('/dept/add', data)
}

/**
 * 删除部门
 * @param {number} id 部门ID
 */
export function deleteDept(id) {
  return deleteRequest(`/dept/delete/${id}`)
}

/**
 * 部门详情
 * @param {number} id 部门ID
 */
export function getDeptDetail(id) {
  return getRequest(`/dept/detail/${id}`)
}

/**
 * 查询部门列表(排除查询节点)
 * @param {number} id 排除的部门ID
 */
export function getDeptListExclude(id) {
  return getRequest(`/dept/exclude/${id}`)
}

/**
 * 部门列表
 * @param {Object} params 查询参数
 * @param {string} params.deptName 部门名称
 * @param {string} params.email 邮箱
 * @param {number} params.id 主键
 * @param {string} params.leader 负责人
 * @param {number} params.orderNum 显示顺序
 * @param {number} params.parentId 父部门ID
 * @param {string} params.phone 联系电话
 * @param {string} params.status 部门状态
 */
export function getDeptList(params) {
  return getRequest('/dept/list', params)
}

/**
 * 获取树形结构部门
 * @param {Object} params 查询参数
 * @param {string} params.deptName 部门名称
 * @param {string} params.email 邮箱
 * @param {number} params.id 主键
 * @param {string} params.leader 负责人
 * @param {number} params.orderNum 显示顺序
 * @param {number} params.parentId 父部门ID
 * @param {string} params.phone 联系电话
 * @param {string} params.status 部门状态
 */
export function getDeptTree(params) {
  return getRequest('/dept/tree', params)
}

/**
 * 修改部门
 * @param {Object} data 部门数据
 * @param {string} data.deptName 部门名称
 * @param {string} data.email 邮箱
 * @param {number} data.id 主键
 * @param {string} data.leader 负责人
 * @param {number} data.orderNum 显示顺序
 * @param {number} data.parentId 父部门ID
 * @param {string} data.phone 联系电话
 * @param {string} data.status 部门状态
 */
export function updateDept(data) {
  return putRequest('/dept/update', data)
}
