/**
 * API Key 设置组件
 */

import React, { useState, useEffect } from 'react'
import { saveApiKey, getApiKey, hasApiKey } from '@/services/ai.service'
import { clsx } from 'clsx'

interface APIKeyInputProps {
  onClose?: () => void
}

export const APIKeyInput: React.FC<APIKeyInputProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (hasApiKey()) {
      const key = getApiKey()
      if (key) {
        setApiKey(key)
        setSaved(true)
      }
    }
  }, [])

  const handleSave = () => {
    if (apiKey.trim()) {
      saveApiKey(apiKey.trim())
      setSaved(true)
      if (onClose) onClose()
    }
  }

  const handleClear = () => {
    saveApiKey('')
    setApiKey('')
    setSaved(false)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          智谱 AI API Key
        </label>
        <div className="relative">
          <input
            type={isVisible ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="输入你的智谱 AI API Key"
            className={clsx(
              'w-full px-4 py-2 pr-24 rounded-lg border',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white'
            )}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              onClick={() => setIsVisible(!isVisible)}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title={isVisible ? '隐藏' : '显示'}
            >
              {isVisible ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          获取 API Key：访问{' '}
          <a
            href="https://open.bigmodel.cn/usercenter/apikeys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            智谱 AI 开放平台
          </a>
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={!apiKey.trim()}
          className={clsx(
            'flex-1 px-4 py-2 rounded-lg font-medium transition-colors',
            'bg-blue-500 text-white hover:bg-blue-600',
            'disabled:bg-gray-300 disabled:cursor-not-allowed',
            'dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-gray-700'
          )}
        >
          {saved ? '更新' : '保存'}
        </button>
        {saved && (
          <button
            onClick={handleClear}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              'bg-gray-200 text-gray-700 hover:bg-gray-300',
              'dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            )}
          >
            清除
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              'bg-gray-200 text-gray-700 hover:bg-gray-300',
              'dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            )}
          >
            取消
          </button>
        )}
      </div>

      {saved && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          API Key 已配置
        </div>
      )}
    </div>
  )
}
