/**
 * AI 增强文本框组件
 * 为任何 textarea 添加 AI 润色功能
 */

import React, { useState, useRef, useEffect } from 'react'
import { useSetAtom, useAtomValue } from 'jotai'
import { AIPolishToolbar, PolishCompareView } from '@/components/AI'
import {
  polishStateAtom,
  startPolishAtom,
  updatePolishedContentAtom,
  finishPolishAtom,
  closePolishCompareAtom,
} from '@/store/atoms'
import { polishContentStream, hasApiKey } from '@/services/ai.service'
import type { PolishMode } from '@/types/ai.types'
import { clsx } from 'clsx'

interface AIEnhancedTextareaProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  rows?: number
  className?: string
  context?: string  // 上下文信息，如"个人简介"、"工作经历"等
}

export const AIEnhancedTextarea: React.FC<AIEnhancedTextareaProps> = ({
  value,
  onChange,
  label,
  placeholder,
  rows = 4,
  className = '',
  context = '内容',
}) => {
  // 确保 value 始终是字符串
  const safeValue = value || ''
  const [isFocused, setIsFocused] = useState(false)
  const [showToolbar, setShowToolbar] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const polishState = useAtomValue(polishStateAtom)
  const startPolish = useSetAtom(startPolishAtom)
  const updatePolishedContent = useSetAtom(updatePolishedContentAtom)
  const finishPolish = useSetAtom(finishPolishAtom)
  const closePolish = useSetAtom(closePolishCompareAtom)

  // 处理润色
  const handlePolish = (mode: PolishMode) => {
    if (!hasApiKey()) {
      alert('请先配置 API Key（点击右下角 AI 按钮）')
      return
    }

    if (!safeValue.trim()) {
      alert('请先输入内容')
      return
    }

    // 开始润色
    startPolish({ mode, content: safeValue })

    // 调用流式润色 API
    polishContentStream(
      safeValue,
      mode,
      // onChunk - 实时更新内容
      (chunk) => {
        updatePolishedContent((prev) => (prev || '') + chunk)
      },
      // onComplete
      () => {
        finishPolish()
      },
      // onError
      (error) => {
        console.error('Polish error:', error)
        updatePolishedContent((prev) => (prev || '') + `\n\n❌ 错误：${error.message}`)
        finishPolish()
      },
      context
    )
  }

  // 接受润色内容
  const handleAcceptPolish = () => {
    onChange(polishState.polishedContent || '')
    closePolish()
  }

  // 拒绝润色内容
  const handleRejectPolish = () => {
    closePolish()
  }

  // 点击外部关闭工具栏
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowToolbar(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      {/* 标签 */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* 文本框容器 */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={safeValue}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true)
            setShowToolbar(true)
          }}
          onBlur={() => setIsFocused(false)}
          rows={rows}
          className={clsx(
            'w-full px-3 py-2 border border-gray-300 rounded-md',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            'transition-all duration-200',
            isFocused && 'ring-2 ring-blue-500 border-blue-500',
            className
          )}
          placeholder={placeholder}
        />

        {/* AI 提示图标 */}
        {safeValue.trim() && showToolbar && hasApiKey() && (
          <div className="absolute bottom-2 right-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 dark:bg-purple-900/20 rounded-md text-xs text-purple-600 dark:text-purple-400">
              <span>✨</span>
              <span>AI 可用</span>
            </div>
          </div>
        )}
      </div>

      {/* AI 润色工具栏 */}
      <div className="mt-2">
        {/* 简化版测试按钮 */}
        {showToolbar && safeValue.trim() && (
          <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
            <span className="text-xs text-purple-600 dark:text-purple-400">✨ AI 润色:</span>
            <button
              onClick={() => handlePolish('polish')}
              disabled={polishState.isPolishing || !hasApiKey()}
              className="px-3 py-1 text-xs bg-white dark:bg-gray-800 rounded border border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              基础润色
            </button>
            <button
              onClick={() => handlePolish('expand')}
              disabled={polishState.isPolishing || !hasApiKey()}
              className="px-3 py-1 text-xs bg-white dark:bg-gray-800 rounded border border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              内容扩展
            </button>
            <button
              onClick={() => handlePolish('simplify')}
              disabled={polishState.isPolishing || !hasApiKey()}
              className="px-3 py-1 text-xs bg-white dark:bg-gray-800 rounded border border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              精简内容
            </button>
            <button
              onClick={() => handlePolish('format')}
              disabled={polishState.isPolishing || !hasApiKey()}
              className="px-3 py-1 text-xs bg-white dark:bg-gray-800 rounded border border-orange-300 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              格式优化
            </button>
            {!hasApiKey() && (
              <span className="text-xs text-red-500 dark:text-red-400">请先配置 API Key</span>
            )}
          </div>
        )}

        <AIPolishToolbar
          visible={false}  // 暂时隐藏原工具栏
          onPolish={handlePolish}
          disabled={polishState.isPolishing}
        />
      </div>

      {/* 对比视图 */}
      {polishState.showCompare && (
        <PolishCompareView
          original={polishState.originalContent}
          polished={polishState.polishedContent}
          mode={polishState.currentMode!}
          onAccept={handleAcceptPolish}
          onReject={handleRejectPolish}
          isStreaming={polishState.isPolishing}
        />
      )}
    </div>
  )
}
