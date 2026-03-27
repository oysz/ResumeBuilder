/**
 * Jotai 状态管理 - 简历数据原子
 */

import { atom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import type {
  ResumeData,
  ResumeSection,
  PersonalInfo,
  ResumeSettings,
  VersionSnapshot,
} from '@/types'
import {
  createDefaultResumeData,
  DEFAULT_PERSONAL_INFO,
  DEFAULT_SETTINGS,
  MAX_VERSION_HISTORY,
  createVersionSnapshot,
} from '@resume-builder/core'
import type { UpdateState } from '@/types/update.types'
import type { ToastState } from '@/types/share.types'
import type { ChatMessage } from '@/types/ai.types'
export { getSectionData, updateSectionData } from '@resume-builder/core'

// ============ 主要状态原子 ============

// 简历数据 (持久化到 localStorage)
const defaultResumeData: ResumeData = createDefaultResumeData()

export const resumeDataAtom = atomWithStorage<ResumeData>(
  'resume-data',
  defaultResumeData,
  createJSONStorage(() => localStorage),
  {
    getOnInit: true, // Ensure data is loaded on initialization
  }
)

// ============ 派生原子 ============

// 个人信息
export const personalInfoAtom = atom(
  (get) => {
    const data = get(resumeDataAtom)
    return data?.personalInfo || DEFAULT_PERSONAL_INFO
  },
  (get, set, newValue: PersonalInfo | ((prev: PersonalInfo) => PersonalInfo)) => {
    const base = get(resumeDataAtom) || defaultResumeData
    const result =
      typeof newValue === 'function' ? newValue(base.personalInfo || DEFAULT_PERSONAL_INFO) : newValue
    set(resumeDataAtom, {
      ...base,
      personalInfo: result,
      metadata: {
        ...base.metadata,
        lastModified: Date.now(),
      },
    })
  }
)

// 简历区块
export const sectionsAtom = atom(
  (get) => {
    const data = get(resumeDataAtom)
    const sections = data?.sections
    // 确保 sections 是一个数组
    if (Array.isArray(sections)) {
      return sections
    }
    console.warn('sections is not an array:', sections, 'data:', data)
    return defaultResumeData.sections
  },
  (get, set, newValue: ResumeSection[] | ((prev: ResumeSection[]) => ResumeSection[])) => {
    const data = get(resumeDataAtom)
    if (!data || typeof data !== 'object') {
      console.warn('resumeDataAtom returned invalid data:', data)
      // Create a fresh copy of default data
      set(resumeDataAtom, {
        ...defaultResumeData,
        metadata: { ...defaultResumeData.metadata },
      })
      return
    }

    // Handle both function and direct value
    const finalValue = typeof newValue === 'function'
      ? newValue(data.sections || defaultResumeData.sections)
      : newValue

    // Ensure the result is an array
    if (!Array.isArray(finalValue)) {
      console.error('setSections result is not an array:', finalValue)
      return
    }

    set(resumeDataAtom, {
      ...data,
      sections: finalValue,
      metadata: {
        ...data.metadata,
        lastModified: Date.now(),
      },
    })
  }
)

// 设置
export const settingsAtom = atom(
  (get) => {
    const data = get(resumeDataAtom)
    return data?.settings || DEFAULT_SETTINGS
  },
  (get, set, newValue: ResumeSettings | ((prev: ResumeSettings) => ResumeSettings)) => {
    const base = get(resumeDataAtom) || defaultResumeData
    set(resumeDataAtom, {
      ...base,
      settings: typeof newValue === 'function' ? newValue(base.settings) : newValue,
      metadata: {
        ...base.metadata,
        lastModified: Date.now(),
      },
    })
  }
)

// 元数据
export const metadataAtom = atom(
  (get) => get(resumeDataAtom).metadata,
  (get, set, newValue: Partial<ResumeData['metadata']>) => {
    const base = get(resumeDataAtom)
    set(resumeDataAtom, {
      ...base,
      metadata: {
        ...base.metadata,
        ...newValue,
        lastModified: Date.now(),
      },
    })
  }
)

// ============ 操作原子 ============

// 创建新简历
export const createNewResumeAtom = atom(null, (_get, set, title?: string) => {
  set(resumeDataAtom, createDefaultResumeData(title))
})

// 重置简历
export const resetResumeAtom = atom(null, (_get, set) => {
  set(resumeDataAtom, createDefaultResumeData())
})

// ============ 拖拽状态 ============

export interface DragState {
  draggedItem: { id: string; type: string; index: number } | null
  dropTarget: { allowed: boolean; newIndex: number } | null
  isDragging: boolean
}

export const dragStateAtom = atom<DragState>({
  draggedItem: null,
  dropTarget: null,
  isDragging: false,
})

export const setDraggingAtom = atom(null, (_get, set, isDragging: boolean) => {
  set(dragStateAtom, (prev) => ({ ...prev, isDragging }))
})

export const setDraggedItemAtom = atom(
  null,
  (_get, set, item: DragState['draggedItem']) => {
    set(dragStateAtom, (prev) => ({ ...prev, draggedItem: item, isDragging: !!item }))
  }
)

export const setDropTargetAtom = atom(
  null,
  (_get, set, target: DragState['dropTarget']) => {
    set(dragStateAtom, (prev) => ({ ...prev, dropTarget: target }))
  }
)

// ============ 版本历史 ============

export const versionHistoryAtom = atomWithStorage<VersionSnapshot[]>(
  'resume-versions',
  [],
  createJSONStorage(() => localStorage)
)

export const addVersionAtom = atom(null, (get, set, description?: string) => {
  const currentData = get(resumeDataAtom)
  const versions = get(versionHistoryAtom)
  const newVersion: VersionSnapshot = createVersionSnapshot(currentData, versions.length, description)
  const updatedVersions = [newVersion, ...versions].slice(0, MAX_VERSION_HISTORY)
  set(versionHistoryAtom, updatedVersions)
})

export const restoreVersionAtom = atom(null, (get, set, versionId: string) => {
  const versions = get(versionHistoryAtom)
  const version = versions.find((v) => v.id === versionId)
  if (version) {
    set(resumeDataAtom, JSON.parse(JSON.stringify(version.data)) as ResumeData)
  }
})

export const clearVersionsAtom = atom(null, (_get, set) => {
  set(versionHistoryAtom, [])
})

// ============ UI 状态 ============

export const isPreviewModeAtom = atom(false)
export const isEditorPanelOpenAtom = atom(true)
export const activeSectionAtom = atom<string | null>(null)
export const selectedItemIdAtom = atom<string | null>(null)

// ============ 自动更新状态 ============

const defaultUpdateState: UpdateState = {
  visible: false,
  status: 'checking',
  message: '',
}

export const updateStateAtom = atomWithStorage<UpdateState>(
  'update-state',
  defaultUpdateState,
  createJSONStorage(() => localStorage)
)

export const setUpdateStatusAtom = atom(
  null,
  (_get, set, data: Partial<UpdateState>) => {
    set(updateStateAtom, (prev) => ({ ...prev, ...data }))
  }
)

export const resetUpdateStateAtom = atom(null, (_get, set) => {
  set(updateStateAtom, defaultUpdateState)
})

// ============ Toast 通知状态 ============

const defaultToastState: ToastState = {
  visible: false,
  message: '',
  type: 'info',
}

export const toastStateAtom = atomWithStorage<ToastState>(
  'toast-state',
  defaultToastState,
  createJSONStorage(() => sessionStorage)
)

export const showToastAtom = atom(
  null,
  (_get, set, data: Omit<ToastState, 'visible'>) => {
    set(toastStateAtom, { visible: true, ...data })
  }
)

export const hideToastAtom = atom(null, (_get, set) => {
  set(toastStateAtom, defaultToastState)
})

// ============ AI 助手状态 ============

// AI 面板开关
export const aiPanelOpenAtom = atom(false)

// AI 聊天历史
export const aiChatHistoryAtom = atomWithStorage<ChatMessage[]>(
  'ai-chat-history',
  [],
  createJSONStorage(() => localStorage)
)

// AI 正在流式输出
export const aiIsStreamingAtom = atom(false)

// AI 当前输入
export const aiInputAtom = atom('')

// 添加 AI 消息
export const addAIMessageAtom = atom(
  null,
  (_get, set, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: Date.now(),
    }
    set(aiChatHistoryAtom, (prev) => [...prev, newMessage])
  }
)

// 更新最后一条 AI 消息（用于流式输出）
export const updateLastAIMessageAtom = atom(
  null,
  (_get, set, contentUpdater: string | ((prev: string) => string)) => {
    set(aiChatHistoryAtom, (prev) => {
      const updated = [...prev]
      const lastMessage = updated[updated.length - 1]

      if (lastMessage && lastMessage.role === 'assistant') {
        const newContent =
          typeof contentUpdater === 'function'
            ? contentUpdater(lastMessage.content)
            : contentUpdater
        updated[updated.length - 1] = {
          ...lastMessage,
          content: newContent,
        }
      }

      return updated
    })
  }
)

// 清空 AI 聊天历史
export const clearAIChatHistoryAtom = atom(null, (_get, set) => {
  set(aiChatHistoryAtom, [])
})

// ============ AI 润色状态 ============

import type { PolishMode, PolishState } from '@/types/ai.types'

// 润色状态
export const polishStateAtom = atom<PolishState>({
  isPolishing: false,
  currentMode: null,
  originalContent: '',
  polishedContent: '',
  showCompare: false,
})

// 设置润色中
export const setPolishingAtom = atom(null, (_get, set, isPolishing: boolean) => {
  set(polishStateAtom, (prev) => ({ ...prev, isPolishing }))
})

// 开始润色
export const startPolishAtom = atom(null, (_get, set, { mode, content }: { mode: PolishMode; content: string }) => {
  set(polishStateAtom, {
    isPolishing: true,
    currentMode: mode,
    originalContent: content,
    polishedContent: '',
    showCompare: true,
  })
})

// 更新润色内容（流式）
export const updatePolishedContentAtom = atom(
  null,
  (_get, set, contentUpdater: string | ((prev: string) => string)) => {
    set(polishStateAtom, (prev) => ({
      ...prev,
      polishedContent:
        typeof contentUpdater === 'function'
          ? contentUpdater(prev.polishedContent || '')
          : contentUpdater,
    }))
  }
)

// 完成润色
export const finishPolishAtom = atom(null, (_get, set) => {
  set(polishStateAtom, (prev) => ({ ...prev, isPolishing: false }))
})

// 关闭对比视图
export const closePolishCompareAtom = atom(null, (_get, set) => {
  set(polishStateAtom, {
    isPolishing: false,
    currentMode: null,
    originalContent: '',
    polishedContent: '',
    showCompare: false,
  })
})
