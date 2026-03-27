import AsyncStorage from '@react-native-async-storage/async-storage'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import type { FileAdapter, ResumeData, StorageAdapter } from '@resume-builder/core'
import { parseResumeData, serializeResumeData } from '@resume-builder/core'

export const asyncStorageAdapter: StorageAdapter = {
  async getItem<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  },
  async setItem<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value))
  },
  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key)
  },
}

export const expoFileAdapter: FileAdapter = {
  async importJson(): Promise<ResumeData> {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
      multiple: false,
    })

    if (result.canceled || !result.assets.length) {
      throw new Error('已取消导入')
    }

    const document = result.assets[0]
    const content = await FileSystem.readAsStringAsync(document.uri)
    return parseResumeData(content)
  },

  async exportJson(data: ResumeData, filename?: string): Promise<string> {
    const safeFilename = (filename || data.metadata.title || 'resume')
      .trim()
      .replace(/[^\w\u4e00-\u9fa5-]+/g, '-')

    const fileUri = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory}${safeFilename}.json`
    await FileSystem.writeAsStringAsync(fileUri, serializeResumeData(data), {
      encoding: FileSystem.EncodingType.UTF8,
    })

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: '导出简历 JSON',
        UTI: 'public.json',
      })
    }

    return fileUri
  },
}
