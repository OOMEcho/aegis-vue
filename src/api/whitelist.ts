import { getRequest, postRequest, putRequest, deleteRequest } from '@/utils/request'

export function addWhitelist(data: Record<string, unknown>) {
  return postRequest('/whitelist/add', data)
}

export function deleteWhitelist(id: number) {
  return deleteRequest(`/whitelist/delete/${id}`)
}

export function getWhitelistDetail(id: number) {
  return getRequest(`/whitelist/detail/${id}`)
}

export function getWhitelistPageList(params: Record<string, unknown>) {
  return getRequest('/whitelist/pageList', params)
}

export function updateWhitelist(data: Record<string, unknown>) {
  return putRequest('/whitelist/update', data)
}
