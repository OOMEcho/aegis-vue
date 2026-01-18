import {getDictionaryList} from '@/api/dictionary'

// 简单内存缓存 + 请求去重
const dictCache = {}
const dictPending = {}

function normalizeDict(list) {
  return (list || [])
    .filter(item => item.status !== '1')
    .sort((a, b) => (a.dictSort || 0) - (b.dictSort || 0))
}

export async function loadDict(dictType) {
  if (dictCache[dictType]) {
    return dictCache[dictType]
  }
  if (dictPending[dictType]) {
    return dictPending[dictType]
  }
  // 同一字典类型并发请求时复用 Promise
  dictPending[dictType] = getDictionaryList(dictType)
    .then(list => {
      const normalized = normalizeDict(list)
      dictCache[dictType] = normalized
      delete dictPending[dictType]
      return normalized
    })
    .catch(error => {
      delete dictPending[dictType]
      throw error
    })
  return dictPending[dictType]
}

export function getDictLabel(options = [], value) {
  const match = options.find(item => String(item.dictValue) === String(value))
  return match ? match.dictLabel : value
}
