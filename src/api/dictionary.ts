import { getRequest, postRequest, putRequest, deleteRequest } from '@/utils/request'

export function addDictionary(data: Record<string, unknown>) {
  return postRequest('/dictionary/add', data)
}

export function deleteDictionary(id: number) {
  return deleteRequest(`/dictionary/delete/${id}`)
}

export function getDictionaryList(dictType: string) {
  return getRequest('/dictionary/list', { dictType })
}

export function getDictionaryPageList(params: Record<string, unknown>) {
  return getRequest('/dictionary/pageList', params)
}

export function updateDictionary(data: Record<string, unknown>) {
  return putRequest('/dictionary/update', data)
}
