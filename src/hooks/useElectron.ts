/**
 * Electron 集成 Hook
 * 处理 Electron 特定的功能
 */

import { useEffect } from 'react'
import { useAtomValue } from 'jotai'
import { resumeDataAtom } from '@/store/atoms'
import type { UpdateStatusData } from '@/types/update.types'

// 类型声明在 src/types/electron.d.ts 中

export const useElectron = () => {
  const resumeData = useAtomValue(resumeDataAtom)

  useEffect(() => {
    // 检查是否在 Electron 环境中运行
    if (!window.electronAPI) return

    const cleanupNewResume = window.electronAPI.onNewResume(() => {
      if (confirm('确定要创建新简历吗？当前未保存的内容将丢失。')) {
        localStorage.removeItem('resume-data')
        localStorage.removeItem('resume-versions')
        window.location.reload()
      }
    })

    const cleanupLoadResume = window.electronAPI.onLoadResume((data) => {
      localStorage.setItem('resume-data', JSON.stringify(data))
      window.location.reload()
    })

    const cleanupSaveResume = window.electronAPI.onSaveResumeData(() => {
      if (resumeData) {
        // 通过全局事件发送数据到主进程
        window.dispatchEvent(new CustomEvent('electron-save-resume', { detail: resumeData }))
      }
    })

    const cleanupExportPDF = window.electronAPI.onExportPDF(() => {
      const exportButton = document.querySelector('button:has(.text-white.bg-blue-600)') as HTMLButtonElement
      if (exportButton) {
        exportButton.click()
      }
    })

    return () => {
      cleanupNewResume?.()
      cleanupLoadResume?.()
      cleanupSaveResume?.()
      cleanupExportPDF?.()
    }
  }, [resumeData])

  // 监听自定义事件来处理保存
  useEffect(() => {
    const handleSave = (e: any) => {
      if (window.electronAPI && (window as any).ipcRenderer) {
        const ipcRenderer = (window as any).ipcRenderer
        ipcRenderer.send('save-resume-data', e.detail)
      }
    }
    window.addEventListener('electron-save-resume', handleSave)
    return () => window.removeEventListener('electron-save-resume', handleSave)
  }, [])

  // 监听更新状态
  useEffect(() => {
    if (!window.electronAPI?.onUpdateStatus) return

    const cleanupUpdateStatus = window.electronAPI.onUpdateStatus((data: UpdateStatusData) => {
      console.log('更新状态:', data)

      // 触发自定义事件，让 UpdateDialog 组件监听
      if (data.status === 'update-available') {
        window.dispatchEvent(new CustomEvent('update-available', { detail: data }))
      } else if (data.status === 'update-downloaded') {
        window.dispatchEvent(new CustomEvent('update-downloaded', { detail: data }))
      } else if (data.status === 'error') {
        console.error('更新错误:', data.error)
      }
    })

    return () => {
      cleanupUpdateStatus?.()
    }
  }, [])

  return {
    isElectron: !!window.electronAPI,
    platform: window.electronAPI?.platform || null,
    checkForUpdates: () => window.electronAPI?.checkForUpdates(),
    downloadUpdate: () => window.electronAPI?.downloadUpdate(),
    installUpdate: () => window.electronAPI?.installUpdate(),
  }
}
