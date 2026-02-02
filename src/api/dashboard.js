import {getRequest} from "@/utils/request"

/**
 * 获取统计卡片数据
 */
export function getDashboardStatistics() {
  return getRequest('/dashboard/statistics')
}

/**
 * 获取访问趋势数据
 * @param {string} days 天数
 */
export function getDashboardAccessTrend(days) {
  return getRequest('/dashboard/accessTrend', {days})
}
