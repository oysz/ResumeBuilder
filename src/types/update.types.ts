/**
 * 自动更新相关类型定义
 */

export type UpdateStatusType =
  | 'checking'
  | 'update-available'
  | 'update-not-available'
  | 'downloading'
  | 'update-downloaded'
  | 'error'

export interface UpdateProgress {
  percent: number
  transferred: number // MB
  total: number // MB
}

export interface UpdateInfo {
  version: string
  releaseDate: string
  releaseNotes?: string
}

export interface UpdateStatusData {
  status: UpdateStatusType
  message: string
  info?: UpdateInfo
  currentVersion?: string
  progress?: UpdateProgress
  error?: string
}

export interface UpdateState {
  visible: boolean
  status: UpdateStatusType
  message: string
  updateInfo?: UpdateInfo
  currentVersion?: string
  downloadProgress?: UpdateProgress
  error?: string
}
