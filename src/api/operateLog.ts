import { getRequest } from '@/utils/request'

export function exportOperateLog(params: Record<string, unknown>) {
  return getRequest('/operateLog/export', params, { responseType: 'blob' })
}

export function getOperateLogPageList(params: Record<string, unknown>) {
  return getRequest('/operateLog/pageList', params)
}
