import { getRequest, postRequest, putRequest, deleteRequest } from '@/utils/request'

export function getResourcePageList(params: Record<string, unknown>) {
  return getRequest('/resources/pageList', params)
}

export function getResourceDetail(id: number) {
  return getRequest(`/resources/detail/${id}`)
}

export function addResource(data: Record<string, unknown>) {
  return postRequest('/resources/add', data)
}

export function updateResource(data: Record<string, unknown>) {
  return putRequest('/resources/update', data)
}

export function deleteResource(id: number) {
  return deleteRequest(`/resources/delete/${id}`)
}
