/**
 * Electron API 类型声明
 */

declare global {
  interface Window {
    electronAPI: {
      platform: string
      onNewResume: (callback: () => void) => () => void
      onLoadResume: (callback: (data: any) => void) => () => void
      requestResumeData: () => void
      onSaveResumeData: (callback: (data: any) => void) => () => void
      onExportPDF: (callback: () => void) => () => void
    }
  }
}

export {}
