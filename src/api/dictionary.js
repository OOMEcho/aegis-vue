import {getRequest, postRequest, putRequest, deleteRequest} from "@/utils/request"

/**
 * 新增字典
 * @param {Object} data 字典数据
 * @param {string} data.dictLabel 字典标签
 * @param {string} data.dictName 字典名称
 * @param {number} data.dictSort 字典排序
 * @param {string} data.dictType 字典类型
 * @param {string} data.dictValue 字典键值
 * @param {number} data.id 主键ID
 * @param {number} data.pageNum 页数
 * @param {number} data.pageSize 当前页大小
 * @param {string} data.remark 备注
 * @param {string} data.sortField 排序字段
 * @param {string} data.sortOrder 排序方式 ASC DESC
 * @param {string} data.status 状态
 */
export function addDictionary(data) {
  return postRequest('/dictionary/add', data)
}

/**
 * 删除字典
 * @param {number} id 字典ID
 */
export function deleteDictionary(id) {
  return deleteRequest(`/dictionary/delete/${id}`)
}

/**
 * 字典详情
 * @param {number} id 字典ID
 */
export function getDictionaryDetail(id) {
  return getRequest(`/dictionary/detail/${id}`)
}

/**
 * 根据类型获取字典列表
 * @param {string} dictType 字典类型
 */
export function getDictionaryList(dictType) {
  return getRequest('/dictionary/list', {dictType})
}

/**
 * 分页列表
 * @param {Object} params 查询参数
 * @param {string} params.dictLabel 字典标签
 * @param {string} params.dictName 字典名称
 * @param {number} params.dictSort 字典排序
 * @param {string} params.dictType 字典类型
 * @param {string} params.dictValue 字典键值
 * @param {number} params.id 主键ID
 * @param {number} params.pageNum 页数
 * @param {number} params.pageSize 当前页大小
 * @param {string} params.remark 备注
 * @param {string} params.sortField 排序字段
 * @param {string} params.sortOrder 排序方式 ASC DESC
 * @param {string} params.status 状态
 */
export function getDictionaryPageList(params) {
  return getRequest('/dictionary/pageList', params)
}

/**
 * 修改字典
 * @param {Object} data 字典数据
 * @param {string} data.dictLabel 字典标签
 * @param {string} data.dictName 字典名称
 * @param {number} data.dictSort 字典排序
 * @param {string} data.dictType 字典类型
 * @param {string} data.dictValue 字典键值
 * @param {number} data.id 主键ID
 * @param {number} data.pageNum 页数
 * @param {number} data.pageSize 当前页大小
 * @param {string} data.remark 备注
 * @param {string} data.sortField 排序字段
 * @param {string} data.sortOrder 排序方式 ASC DESC
 * @param {string} data.status 状态
 */
export function updateDictionary(data) {
  return putRequest('/dictionary/update', data)
}
