/**
 * AI 润色对比视图组件
 */

import React from 'react'
import type { PolishMode } from '@/types/ai.types'
import { getPolishModeConfig } from '@/services/ai.service'
import { clsx } from 'clsx'

interface PolishCompareViewProps {
  original: string
  polished: string
  mode: PolishMode
  onAccept: () => void
  onReject: () => void
  isStreaming?: boolean
}

export const PolishCompareView: React.FC<PolishCompareViewProps> = ({
  original,
  polished,
  mode,
  onAccept,
  onReject,
  isStreaming = false,
}) => {
  const config = getPolishModeConfig(mode)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[80vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {config.label}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {config.description}
              </p>
            </div>
          </div>

          {/* 流式输出指示器 */}
          {isStreaming && (
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              AI 正在润色中...
            </div>
          )}
        </div>

        {/* 对比区域 */}
        <div className="flex-1 overflow-hidden flex">
          {/* 原内容 */}
          <div className="flex-1 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                原内容
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                {original || <span className="text-gray-400 italic">暂无内容</span>}
              </div>
            </div>
          </div>

          {/* 润色后内容 */}
          <div className="flex-1 flex flex-col">
            <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">
                AI 润色后
                {isStreaming && (
                  <span className="ml-2 text-xs text-blue-500 animate-pulse">
                    ● 输出中
                  </span>
                )}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-blue-50/30 dark:bg-blue-900/10">
              <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                {isStreaming && !polished ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex items-center gap-2 text-gray-400">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>AI 正在思考...</span>
                    </div>
                  </div>
                ) : (
                  polished || <span className="text-gray-400 italic">等待润色...</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={onReject}
            disabled={isStreaming}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              'bg-gray-200 text-gray-700 hover:bg-gray-300',
              'dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            使用原内容
          </button>
          <button
            onClick={onAccept}
            disabled={isStreaming || !polished}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              'bg-blue-500 text-white hover:bg-blue-600',
              'dark:bg-blue-600 dark:hover:bg-blue-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            使用润色内容
          </button>
        </div>
      </div>
    </div>
  )
}
