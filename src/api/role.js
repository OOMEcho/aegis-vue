import {getRequest, postRequest, putRequest, deleteRequest} from "@/utils/request"

/**
 * 新增角色
 * @param {Object} data 角色数据
 * @param {string} data.dataScope 数据范围(1-全部数据权限,2-自定数据权限,3-本部门数据权限,4-本部门及以下数据权限,5-仅本人数据权限)
 * @param {number} data.deptCheckStrictly 部门树选择项是否关联显示
 * @param {Array} data.deptIds 部门组(数据权限)
 * @param {number} data.id 主键ID
 * @param {number} data.orderNum 显示顺序
 * @param {number} data.pageNum 页数
 * @param {number} data.pageSize 当前页大小
 * @param {string} data.remark 备注
 * @param {string} data.roleCode 角色编码
 * @param {string} data.roleName 角色名称
 * @param {string} data.sortField 排序字段
 * @param {string} data.sortOrder 排序方式 ASC DESC
 * @param {string} data.status 角色状态(0-正常,1-停用)
 */
export function addRole(data) {
  return postRequest('/role/add', data)
}

/**
 * 查询已分配用户角色列表
 * @param {Object} params 查询参数
 * @param {number} params.pageNum 页数
 * @param {number} params.pageSize 当前页大小
 * @param {string} params.phone 电话
 * @param {number} params.roleId 角色ID
 * @param {string} params.sortField 排序字段
 * @param {string} params.sortOrder 排序方式 ASC DESC
 * @param {string} params.username 用户名
 */
export function getAllocatedList(params) {
  return getRequest('/role/allocatedList', params)
}

/**
 * 取消授权用户
 * @param {Object} data 取消授权数据
 * @param {number} data.roleId 角色ID
 * @param {number} data.userId 用户ID
 */
export function cancelAuth(data) {
  return putRequest('/role/cancel', data)
}

/**
 * 批量选择用户授权
 * @param {Object} data 批量选择授权数据
 * @param {number} data.roleId 角色ID
 * @param {Array} data.userIds 用户组ID
 */
export function selectAuthAll(data) {
  return postRequest('/role/selectAll', data)
}

/**
 * 查询未分配用户角色列表
 * @param {Object} params 查询参数
 * @param {number} params.pageNum 页数
 * @param {number} params.pageSize 当前页大小
 * @param {string} params.phone 电话
 * @param {number} params.roleId 角色ID
 * @param {string} params.sortField 排序字段
 * @param {string} params.sortOrder 排序方式 ASC DESC
 * @param {string} params.username 用户名
 */
export function getUnallocatedList(params) {
  return getRequest('/role/unallocatedList', params)
}

/**
 * 批量取消授权用户
 * @param {Object} data 批量取消授权数据
 * @param {number} data.roleId 角色ID
 * @param {Array} data.userIds 用户组ID
 */
export function cancelAuthAll(data) {
  return putRequest('/role/cancelAll', data)
}

/**
 * 删除角色
 * @param {number} id 角色ID
 */
export function deleteRole(id) {
  return deleteRequest(`/role/delete/${id}`)
}

/**
 * 角色分页列表
 * @param {Object} params 查询参数
 * @param {string} params.dataScope 数据范围(1-全部数据权限,2-自定数据权限,3-本部门数据权限,4-本部门及以下数据权限,5-仅本人数据权限)
 * @param {number} params.deptCheckStrictly 部门树选择项是否关联显示
 * @param {Array} params.deptIds 部门组(数据权限)
 * @param {number} params.id 主键ID
 * @param {number} params.orderNum 显示顺序
 * @param {number} params.pageNum 页数
 * @param {number} params.pageSize 当前页大小
 * @param {string} params.remark 备注
 * @param {string} params.roleCode 角色编码
 * @param {string} params.roleName 角色名称
 * @param {string} params.sortField 排序字段
 * @param {string} params.sortOrder 排序方式 ASC DESC
 * @param {string} params.status 角色状态(0-正常,1-停用)
 */
export function getRolePageList(params) {
  return getRequest('/role/pageList', params)
}

/**
 * 获取对应角色部门树
 * @param {number} roleId 角色ID
 */
export function getRoleWithDeptTree(roleId) {
  return getRequest(`/role/roleWithDeptTree/${roleId}`)
}

/**
 * 获取角色权限列表
 * @param {number} roleId 角色ID
 */
export function getRolePermissions(roleId) {
  return getRequest(`/role/${roleId}/permissions`)
}

/**
 * 给角色分配权限
 * @param {number} roleId 角色ID
 * @param {Array} permCodes 权限编码列表
 */
export function assignRolePermissions(roleId, permCodes) {
  return postRequest(`/role/${roleId}/permissions`, permCodes)
}

/**
 * 修改角色
 * @param {Object} data 角色数据
 * @param {string} data.dataScope 数据范围(1-全部数据权限,2-自定数据权限,3-本部门数据权限,4-本部门及以下数据权限,5-仅本人数据权限)
 * @param {number} data.deptCheckStrictly 部门树选择项是否关联显示
 * @param {Array} data.deptIds 部门组(数据权限)
 * @param {number} data.id 主键ID
 * @param {number} data.orderNum 显示顺序
 * @param {number} data.pageNum 页数
 * @param {number} data.pageSize 当前页大小
 * @param {string} data.remark 备注
 * @param {string} data.roleCode 角色编码
 * @param {string} data.roleName 角色名称
 * @param {string} data.sortField 排序字段
 * @param {string} data.sortOrder 排序方式 ASC DESC
 * @param {string} data.status 角色状态(0-正常,1-停用)
 */
export function updateRole(data) {
  return putRequest('/role/update', data)
}

/**
 * 修改角色数据权限
 * @param {Object} data 角色数据
 * @param {string} data.dataScope 数据范围(1-全部数据权限,2-自定数据权限,3-本部门数据权限,4-本部门及以下数据权限,5-仅本人数据权限)
 * @param {number} data.deptCheckStrictly 部门树选择项是否关联显示
 * @param {Array} data.deptIds 部门组(数据权限)
 * @param {number} data.id 主键ID
 * @param {number} data.orderNum 显示顺序
 * @param {number} data.pageNum 页数
 * @param {number} data.pageSize 当前页大小
 * @param {string} data.remark 备注
 * @param {string} data.roleCode 角色编码
 * @param {string} data.roleName 角色名称
 * @param {string} data.sortField 排序字段
 * @param {string} data.sortOrder 排序方式 ASC DESC
 * @param {string} data.status 角色状态(0-正常,1-停用)
 */
export function updateRoleDataScope(data) {
  return putRequest('/role/updateRoleDataScope', data)
}

/**
 * 修改角色状态
 * @param {number} id 角色ID
 */
export function updateRoleStatus(id) {
  return putRequest(`/role/updateStatus/${id}`)
}
