import { getRequest } from '@/utils/request'

export function getDashboardStatistics() {
  return getRequest('/dashboard/statistics')
}

export function getDashboardAccessTrend(days: number | string) {
  return getRequest('/dashboard/accessTrend', { days })
}
