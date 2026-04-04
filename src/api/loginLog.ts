import { getRequest } from '@/utils/request'

export function exportLoginLog(params: Record<string, unknown>) {
  return getRequest('/loginLog/export', params, { responseType: 'blob' })
}

export function getLoginLogPageList(params: Record<string, unknown>) {
  return getRequest('/loginLog/pageList', params)
}
