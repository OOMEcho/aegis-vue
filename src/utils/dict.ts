import { getDictionaryList } from '@/api/dictionary'

interface DictItem {
  dictLabel: string
  dictValue: string
  dictSort?: number
  status?: string
}

interface CacheEntry {
  data: DictItem[]
  ts: number
}

const dictCache: Record<string, CacheEntry> = {}
const dictPending: Record<string, Promise<DictItem[]>> = {}
const DICT_CACHE_TTL = 30 * 60 * 1000

function normalizeDict(list: DictItem[]): DictItem[] {
  return (list || [])
    .filter(item => item.status !== '1')
    .sort((a, b) => (a.dictSort || 0) - (b.dictSort || 0))
}

export async function loadDict(dictType: string): Promise<DictItem[]> {
  const cached = dictCache[dictType]
  if (cached && Date.now() - cached.ts < DICT_CACHE_TTL) {
    return cached.data
  }
  if (cached) {
    delete dictCache[dictType]
  }
  if (dictPending[dictType] != null) {
    return dictPending[dictType]
  }
  dictPending[dictType] = getDictionaryList(dictType)
    .then((list: any) => {
      const normalized = normalizeDict(list)
      dictCache[dictType] = { data: normalized, ts: Date.now() }
      delete dictPending[dictType]
      return normalized
    })
    .catch((error: unknown) => {
      delete dictPending[dictType]
      throw error
    })
  return dictPending[dictType]
}

export function getDictLabel(options: DictItem[] = [], value: string | number): string {
  const match = options.find(item => String(item.dictValue) === String(value))
  return match ? match.dictLabel : String(value)
}
