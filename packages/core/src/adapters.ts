import type { ResumeData } from './resume.types'

export interface StorageAdapter {
  getItem<T>(key: string): Promise<T | null>
  setItem<T>(key: string, value: T): Promise<void>
  removeItem(key: string): Promise<void>
}

export interface FileAdapter {
  importJson(): Promise<ResumeData>
  exportJson(data: ResumeData, filename?: string): Promise<string>
}
