/**
 * AI 助手面板组件
 */

import React, { useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { aiPanelOpenAtom, clearAIChatHistoryAtom } from '@/store/atoms'
import { AIChat } from './AIChat'
import { APIKeyInput } from './APIKeyInput'
import { clsx } from 'clsx'
import { hasApiKey } from '@/services/ai.service'

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useAtom(aiPanelOpenAtom)
  const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('chat')
  const clearHistory = useSetAtom(clearAIChatHistoryAtom)
  const [hasKey, setHasKey] = useState(hasApiKey())

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleClearHistory = () => {
    if (confirm('确定要清空聊天历史吗？')) {
      clearHistory()
    }
  }

  const handleApiKeySaved = () => {
    setHasKey(hasApiKey())
    setActiveTab('chat')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl h-[600px] flex flex-col mx-4">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI 简历助手
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {hasKey ? '已连接智谱 AI' : '请配置 API Key'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 标签切换 */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mr-2">
              <button
                onClick={() => setActiveTab('chat')}
                className={clsx(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  activeTab === 'chat'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                对话
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={clsx(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  activeTab === 'settings'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                设置
              </button>
            </div>

            {activeTab === 'chat' && (
              <button
                onClick={handleClearHistory}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="清空历史"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}

            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="关闭"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' ? (
            !hasKey ? (
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    需要配置 API Key
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    请先在设置中配置智谱 AI API Key 才能使用对话功能
                  </p>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    前往设置
                  </button>
                </div>
              </div>
            ) : (
              <AIChat />
            )
          ) : (
            <div className="h-full overflow-y-auto p-6">
              <div className="max-w-xl mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  API 配置
                </h3>
                <APIKeyInput onClose={handleApiKeySaved} />

                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    💡 使用说明
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>1. 访问智谱 AI 开放平台获取 API Key</li>
                    <li>2. API Key 将加密存储在本地</li>
                    <li>3. 支持所有智谱 AI 模型（GLM-4、GLM-4V 等）</li>
                    <li>4. 聊天历史会自动保存</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
