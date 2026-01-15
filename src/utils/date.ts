/**
 * 日期工具函数
 */

import { format, parseISO, isValid } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export const DateUtils = {
  /**
   * 格式化日期显示
   */
  formatDate(dateString: string, formatStr: string = 'yyyy-MM'): string {
    try {
      const date = parseISO(dateString)
      if (!isValid(date)) return dateString
      return format(date, formatStr, { locale: zhCN })
    } catch {
      return dateString
    }
  },

  /**
   * 格式化日期范围
   */
  formatDateRange(startDate: string, endDate?: string, current?: boolean): string {
    const formattedStart = this.formatDate(startDate)
    if (current) {
      return `${formattedStart} - 至今`
    }
    if (endDate) {
      const formattedEnd = this.formatDate(endDate)
      return `${formattedStart} - ${formattedEnd}`
    }
    return formattedStart
  },

  /**
   * 获取当前时间戳
   */
  now(): number {
    return Date.now()
  },

  /**
   * 格式化时间戳为可读格式
   */
  formatTimestamp(timestamp: number): string {
    return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })
  },

  /**
   * 计算相对时间
   */
  getRelativeTime(timestamp: number): string {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 30) return `${days}天前`
    return this.formatTimestamp(timestamp)
  },
}
