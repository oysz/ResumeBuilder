/**
 * 自动保存服务
 * 监听简历数据变化并自动保存到 localStorage
 */

import { type ResumeData } from '@/types'

const AUTO_SAVE_KEY = 'resume-autosave'
const AUTO_SAVE_DEBOUNCE = 1000 // 1秒防抖

export class AutoSaveService {
  private saveTimeout: NodeJS.Timeout | null = null
  private lastSaveTime: number = 0
  private saveInProgress = false

  /**
   * 保存简历数据到 localStorage
   */
  save(data: ResumeData): void {
    if (this.saveInProgress) {
      this.scheduleSave(data)
      return
    }

    this.saveInProgress = true
    try {
      const saveData = {
        ...data,
        metadata: {
          ...data.metadata,
          lastModified: Date.now(),
        },
      }
      localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(saveData))
      this.lastSaveTime = Date.now()
      console.log('[AutoSave] 数据已保存')
    } catch (error) {
      console.error('[AutoSave] 保存失败:', error)
    } finally {
      this.saveInProgress = false
    }
  }

  /**
   * 带防抖的保存
   */
  saveDebounced(data: ResumeData): void {
    this.scheduleSave(data)
  }

  /**
   * 调度保存任务
   */
  private scheduleSave(data: ResumeData): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }
    this.saveTimeout = setTimeout(() => {
      this.save(data)
      this.saveTimeout = null
    }, AUTO_SAVE_DEBOUNCE)
  }

  /**
   * 从 localStorage 加载数据
   */
  load(): ResumeData | null {
    try {
      const saved = localStorage.getItem(AUTO_SAVE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('[AutoSave] 加载失败:', error)
    }
    return null
  }

  /**
   * 检查是否有自动保存的数据
   */
  hasAutoSave(): boolean {
    return !!localStorage.getItem(AUTO_SAVE_KEY)
  }

  /**
   * 清除自动保存的数据
   */
  clear(): void {
    localStorage.removeItem(AUTO_SAVE_KEY)
    console.log('[AutoSave] 自动保存数据已清除')
  }

  /**
   * 获取上次保存时间
   */
  getLastSaveTime(): number {
    return this.lastSaveTime
  }

  /**
   * 导出数据为 JSON 文件
   */
  exportToFile(data: ResumeData, filename?: string): void {
    try {
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename || `resume-${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      console.log('[AutoSave] 数据已导出')
    } catch (error) {
      console.error('[AutoSave] 导出失败:', error)
    }
  }

  /**
   * 从文件导入数据
   */
  importFromFile(file: File): Promise<ResumeData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          resolve(data)
        } catch (error) {
          reject(new Error('文件格式错误'))
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file)
    })
  }
}

// 单例实例
export const autoSaveService = new AutoSaveService()
