import { reactive } from 'vue'
import { loadDict, getDictLabel } from '@/utils/dict'

interface DictItem {
  dictLabel: string
  dictValue: string
  dictSort?: number
  status?: string
}

export function useDict() {
  const dicts = reactive<Record<string, DictItem[]>>({})

  async function loadDictOptions(dictType: string) {
    const list = await loadDict(dictType)
    dicts[dictType] = list
    return list
  }

  function dictLabel(dictType: string, value: string | number): string {
    return getDictLabel(dicts[dictType] || [], value)
  }

  return { dicts, loadDictOptions, dictLabel }
}
