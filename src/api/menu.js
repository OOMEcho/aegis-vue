import {getRequest, postRequest, putRequest, deleteRequest} from "@/api/request"

/**
 * 新增菜单
 * @param {Object} data 菜单数据
 * @param {string} data.component 组件路径
 * @param {boolean} data.hidden 菜单状态(0-显示,1-隐藏)
 * @param {string} data.icon 菜单图标
 * @param {number} data.id 主键ID
 * @param {boolean} data.isFrame 是否为外链(0-否,1-是)
 * @param {boolean} data.keepAlive 是否缓存(0-缓存,1-不缓存)
 * @param {string} data.menuName 菜单名称
 * @param {string} data.menuType 菜单类型(D-目录,M-菜单,B-按钮)
 * @param {string} data.name 路由名称
 * @param {number} data.orderNum 显示顺序
 * @param {number} data.parentId 父菜单ID
 * @param {string} data.path 路由地址
 * @param {string} data.perms 权限标识
 * @param {string} data.requestMethod 请求方法,GET,POST,PUT,DELETE,ALL=不限制
 * @param {string} data.requestUri URL匹配模式,支持Ant风格,比如/api/user/**
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
 * @param {string} params.component 组件路径
 * @param {boolean} params.hidden 菜单状态(0-显示,1-隐藏)
 * @param {string} params.icon 菜单图标
 * @param {number} params.id 主键ID
 * @param {boolean} params.isFrame 是否为外链(0-否,1-是)
 * @param {boolean} params.keepAlive 是否缓存(0-缓存,1-不缓存)
 * @param {string} params.menuName 菜单名称
 * @param {string} params.menuType 菜单类型(D-目录,M-菜单,B-按钮)
 * @param {string} params.name 路由名称
 * @param {number} params.orderNum 显示顺序
 * @param {number} params.parentId 父菜单ID
 * @param {string} params.path 路由地址
 * @param {string} params.perms 权限标识
 * @param {string} params.requestMethod 请求方法,GET,POST,PUT,DELETE,ALL=不限制
 * @param {string} params.requestUri URL匹配模式,支持Ant风格,比如/api/user/**
 * @param {string} params.status 菜单状态(0-正常,1-停用)
 */
export function getMenuList(params) {
  return getRequest('/menu/list', params)
}

/**
 * 获取树形结构菜单
 * @param {Object} params 查询参数
 * @param {string} params.component 组件路径
 * @param {boolean} params.hidden 菜单状态(0-显示,1-隐藏)
 * @param {string} params.icon 菜单图标
 * @param {number} params.id 主键ID
 * @param {boolean} params.isFrame 是否为外链(0-否,1-是)
 * @param {boolean} params.keepAlive 是否缓存(0-缓存,1-不缓存)
 * @param {string} params.menuName 菜单名称
 * @param {string} params.menuType 菜单类型(D-目录,M-菜单,B-按钮)
 * @param {string} params.name 路由名称
 * @param {number} params.orderNum 显示顺序
 * @param {number} params.parentId 父菜单ID
 * @param {string} params.path 路由地址
 * @param {string} params.perms 权限标识
 * @param {string} params.requestMethod 请求方法,GET,POST,PUT,DELETE,ALL=不限制
 * @param {string} params.requestUri URL匹配模式,支持Ant风格,比如/api/user/**
 * @param {string} params.status 菜单状态(0-正常,1-停用)
 */
export function getMenuTree(params) {
  return getRequest('/menu/tree', params)
}

/**
 * 修改菜单
 * @param {Object} data 菜单数据
 * @param {string} data.component 组件路径
 * @param {boolean} data.hidden 菜单状态(0-显示,1-隐藏)
 * @param {string} data.icon 菜单图标
 * @param {number} data.id 主键ID
 * @param {boolean} data.isFrame 是否为外链(0-否,1-是)
 * @param {boolean} data.keepAlive 是否缓存(0-缓存,1-不缓存)
 * @param {string} data.menuName 菜单名称
 * @param {string} data.menuType 菜单类型(D-目录,M-菜单,B-按钮)
 * @param {string} data.name 路由名称
 * @param {number} data.orderNum 显示顺序
 * @param {number} data.parentId 父菜单ID
 * @param {string} data.path 路由地址
 * @param {string} data.perms 权限标识
 * @param {string} data.requestMethod 请求方法,GET,POST,PUT,DELETE,ALL=不限制
 * @param {string} data.requestUri URL匹配模式,支持Ant风格,比如/api/user/**
 * @param {string} data.status 菜单状态(0-正常,1-停用)
 */
export function updateMenu(data) {
  return putRequest('/menu/update', data)
}
