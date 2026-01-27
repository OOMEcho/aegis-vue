import {getDictionaryList} from '@/api/dictionary'

// 简单内存缓存 + 请求去重
const dictCache = {}
const dictPending = {}
const DICT_CACHE_TTL = 30 * 60 * 1000

function normalizeDict(list) {
  return (list || [])
    .filter(item => item.status !== '1')
    .sort((a, b) => (a.dictSort || 0) - (b.dictSort || 0))
}

export async function loadDict(dictType) {
  const cached = dictCache[dictType]
  if (cached && Date.now() - cached.ts < DICT_CACHE_TTL) {
    return cached.data
  }
  if (cached) {
    delete dictCache[dictType]
  }
  if (dictPending[dictType]) {
    return dictPending[dictType]
  }
  // 同一字典类型并发请求时复用 Promise
  dictPending[dictType] = getDictionaryList(dictType)
    .then(list => {
      const normalized = normalizeDict(list)
      dictCache[dictType] = {data: normalized, ts: Date.now()}
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
