/**
 * AI 润色悬浮工具栏组件
 */

import React from 'react'
import type { PolishMode } from '@/types/ai.types'
import { getPolishModeConfig } from '@/services/ai.service'
import { clsx } from 'clsx'

interface AIPolishToolbarProps {
  visible: boolean
  onPolish: (mode: PolishMode) => void
  disabled?: boolean
  className?: string
}

export const AIPolishToolbar: React.FC<AIPolishToolbarProps> = ({
  visible,
  onPolish,
  disabled = false,
  className = '',
}) => {
  const modes: PolishMode[] = ['polish', 'expand', 'simplify', 'format']

  if (!visible) return null

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1 px-3 py-2',
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'rounded-lg shadow-lg',
        'transition-all duration-200',
        'animate-in fade-in slide-in-from-top-2',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

        {modes.map((mode) => {
          const config = getPolishModeConfig(mode)
          const colorClasses = {
            purple: 'hover:bg-purple-50 text-purple-600 dark:text-purple-400 dark:hover:bg-purple-900/20',
            blue: 'hover:bg-blue-50 text-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20',
            green: 'hover:bg-green-50 text-green-600 dark:text-green-400 dark:hover:bg-green-900/20',
            orange: 'hover:bg-orange-50 text-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/20',
          }

          return (
            <button
              key={mode}
              onClick={() => onPolish(mode)}
              disabled={disabled}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md',
                'text-sm font-medium transition-all duration-150',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                colorClasses[config.color as keyof typeof colorClasses]
              )}
              title={config.description}
            >
              <span className="text-base">{config.icon}</span>
              <span className="hidden sm:inline">{config.label}</span>
            </button>
          )
        })}

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* 提示文本 */}
      <div className="ml-2 text-xs text-gray-400 dark:text-gray-500 hidden lg:block">
        AI 润色
      </div>
    </div>
  )
}
