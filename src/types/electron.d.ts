/**
 * Electron API 类型声明
 */

import type { UpdateStatusData } from './update.types'

declare global {
  interface Window {
    electronAPI: {
      platform: string
      onNewResume: (callback: () => void) => () => void
      onLoadResume: (callback: (data: any) => void) => () => void
      requestResumeData: () => void
      onSaveResumeData: (callback: (data: any) => void) => () => void
      onExportPDF: (callback: () => void) => () => void

      // 更新相关 API
      checkForUpdates: () => void
      downloadUpdate: () => void
      installUpdate: () => void
      onUpdateStatus: (callback: (data: UpdateStatusData) => void) => () => void
    }
  }
}

export {}
