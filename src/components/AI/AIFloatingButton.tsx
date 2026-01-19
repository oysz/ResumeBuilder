/**
 * AI 浮动按钮组件
 */

import React from 'react'
import { useSetAtom } from 'jotai'
import { aiPanelOpenAtom } from '@/store/atoms'
import { clsx } from 'clsx'
import { hasApiKey } from '@/services/ai.service'

export const AIFloatingButton: React.FC = () => {
  const setIsOpen = useSetAtom(aiPanelOpenAtom)
  const hasKey = hasApiKey()

  const handleClick = () => {
    setIsOpen(true)
  }

  return (
    <button
      onClick={handleClick}
      className={clsx(
        'fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg',
        'flex items-center justify-center transition-all duration-300',
        'hover:scale-110 active:scale-95',
        'bg-gradient-to-br from-purple-500 to-blue-500 text-white',
        'hover:from-purple-600 hover:to-blue-600'
      )}
      title={hasKey ? '打开 AI 助手' : '配置 AI API Key'}
    >
      <svg
        className="w-7 h-7"
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

      {/* 脉冲动画 */}
      {!hasKey && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75 animate-ping" />
      )}
    </button>
  )
}
