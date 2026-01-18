import {getRequest, postRequest, putRequest, deleteRequest} from "@/utils/request"

/**
 * 新增菜单
 * @param {Object} data 菜单数据
 * @param {string} data.menuCode 菜单编码
 * @param {string} data.menuName 菜单名称
 * @param {number} data.parentId 父菜单ID
 * @param {number} data.orderNum 显示顺序
 * @param {string} data.name 路由名称
 * @param {string} data.path 路由地址
 * @param {string} data.menuType 菜单类型(D-目录,M-菜单)
 * @param {string} data.icon 菜单图标
 * @param {boolean} data.hidden 菜单状态(0-显示,1-隐藏)
 * @param {string} data.status 菜单状态(0-正常,1-停用)
 */
export function addMenu(data) {
  return postRequest('/menu/add', data)
}

/**
 * 删除菜单
 * @param {number} id 菜单ID
 */
export function deleteMenu(id) {
  return deleteRequest(`/menu/delete/${id}`)
}

/**
 * 菜单详情
 * @param {number} id 菜单ID
 */
export function getMenuDetail(id) {
  return getRequest(`/menu/detail/${id}`)
}

/**
 * 菜单列表
 * @param {Object} params 查询参数
 * @param {string} params.menuCode 菜单编码
 * @param {string} params.menuName 菜单名称
 * @param {string} params.name 路由名称
 * @param {string} params.path 路由地址
 * @param {string} params.menuType 菜单类型(D-目录,M-菜单)
 * @param {string} params.status 菜单状态(0-正常,1-停用)
 */
export function getMenuList(params) {
  return getRequest('/menu/list', params)
}

/**
 * 获取树形结构菜单
 * @param {Object} params 查询参数
 */
export function getMenuTree(params) {
  return getRequest('/menu/tree', params)
}

/**
 * 获取菜单权限
 * @param {number} id 菜单ID
 */
export function getMenuPermissions(id) {
  return getRequest(`/menu/${id}/permissions`)
}

/**
 * 给菜单配置权限
 * @param {number} id 菜单ID
 * @param {Array} permCodes 权限编码列表
 */
export function assignMenuPermissions(id, permCodes) {
  return postRequest(`/menu/${id}/permissions`, permCodes)
}

/**
 * 修改菜单
 * @param {Object} data 菜单数据
 */
export function updateMenu(data) {
  return putRequest('/menu/update', data)
}
