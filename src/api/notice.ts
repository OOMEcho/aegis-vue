import { getRequest, postRequest, putRequest, deleteRequest } from '@/utils/request'

export function addNotice(data: Record<string, unknown>) {
  return postRequest('/notice/add', data)
}

export function deleteNotice(id: number) {
  return deleteRequest(`/notice/delete/${id}`)
}

export function getNoticeDetail(id: number) {
  return getRequest(`/notice/detail/${id}`)
}

export function getNoticePageList(params: Record<string, unknown>) {
  return getRequest('/notice/pageList', params)
}

export function publishNotice(id: number) {
  return putRequest(`/notice/publish/${id}`)
}

export function revokeNotice(id: number) {
  return putRequest(`/notice/revoke/${id}`)
}

export function updateNotice(data: Record<string, unknown>) {
  return putRequest('/notice/update', data)
}

export function getUserNoticeDetail(id: number) {
  return getRequest(`/notice/user/detail/${id}`)
}

export function getUserNoticePageList(params: Record<string, unknown>) {
  return getRequest('/notice/user/pageList', params)
}

export function getUnreadCount() {
  return getRequest('/notice/user/unreadCount')
}
