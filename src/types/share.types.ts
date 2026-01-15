/**
 * 分享功能类型定义
 */

export type ShareType = 'clipboard' | 'wechat'

export interface ShareOptions {
  type: ShareType
  format?: 'png' | 'jpg'
  quality?: number
}

export interface ShareResult {
  success: boolean
  type: ShareType
  error?: string
}

export interface ToastState {
  visible: boolean
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}
