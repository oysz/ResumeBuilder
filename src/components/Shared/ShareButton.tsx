/**
 * 分享按钮组件
 * 带下拉菜单，支持复制到剪贴板和打开微信
 */

import React, { useState, useRef, useEffect } from 'react'
import { ShareService } from '@/services/share.service'
import { useToast } from './Toast'

export const ShareButton: React.FC = () => {
  const { showSuccess, showError, showInfo } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCopyToClipboard = async () => {
    setIsLoading(true)
    setIsOpen(false)

    try {
      const previewElement = document.querySelector('[data-template]') as HTMLElement
      if (!previewElement) {
        showError('无法找到预览元素')
        return
      }

      const result = await ShareService.copyToClipboard(previewElement, {
        format: 'png',
        quality: 1,
      })

      if (result.success) {
        showSuccess('图片已复制到剪贴板，可直接粘贴到微信')
      } else {
        showError(`复制失败: ${result.error}`)
      }
    } catch {
      showError('复制失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenWeChat = async () => {
    setIsLoading(true)
    setIsOpen(false)

    try {
      const previewElement = document.querySelector('[data-template]') as HTMLElement
      if (!previewElement) {
        showError('无法找到预览元素')
        return
      }

      // 先复制图片到剪贴板
      const copyResult = await ShareService.copyToClipboard(previewElement, {
        format: 'png',
        quality: 1,
      })

      if (!copyResult.success) {
        showError(`复制失败: ${copyResult.error}`)
        return
      }

      // 复制成功后打开微信
      const openResult = await ShareService.openWeChat()

      if (openResult.success) {
        showSuccess('图片已复制，正在打开微信，请在聊天窗口中粘贴')
      } else {
        showSuccess('图片已复制到剪贴板，请手动打开微信粘贴')
      }
    } catch {
      showError('操作失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShareClick = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 主按钮 */}
      <button
        type="button"
        onClick={handleShareClick}
        disabled={isLoading}
        className={`
          px-4 py-2 text-sm rounded-md
          flex items-center gap-2
          transition-colors duration-150
          ${
            isLoading
              ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
          }
        `}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
        </svg>
        <span>分享</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div
          className="
            absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg
            border border-gray-200 py-1 z-50
            fade-in
          "
        >
          {/* 复制到剪贴板 */}
          <button
            type="button"
            onClick={handleCopyToClipboard}
            disabled={isLoading}
            className={`
              w-full px-4 py-3 text-left text-sm
              flex items-center gap-3
              transition-colors duration-150
              ${
                isLoading
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-md flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-blue-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-medium">复制图片到剪贴板</div>
              <div className="text-xs text-gray-500 mt-0.5">
                复制后可直接粘贴到微信或其他应用
              </div>
            </div>
          </button>

          {/* 分隔线 */}
          <div className="h-px bg-gray-200 my-1" />

          {/* 打开微信 */}
          <button
            type="button"
            onClick={handleOpenWeChat}
            disabled={isLoading}
            className={`
              w-full px-4 py-3 text-left text-sm
              flex items-center gap-3
              transition-colors duration-150
              ${
                isLoading
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex-shrink-0 w-8 h-8 bg-green-50 rounded-md flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-green-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-medium">复制并打开微信</div>
              <div className="text-xs text-gray-500 mt-0.5">
                自动复制图片后打开微信
              </div>
            </div>
          </button>

          {/* 提示信息 */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 leading-relaxed">
              💡 点击后将自动复制图片到剪贴板，然后打开微信
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
