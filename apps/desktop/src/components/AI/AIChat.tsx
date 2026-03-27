/**
 * AI 聊天组件
 */

import React, { useEffect, useRef } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  aiChatHistoryAtom,
  aiInputAtom,
  aiIsStreamingAtom,
  addAIMessageAtom,
  updateLastAIMessageAtom,
} from '@/store/atoms'
import { AIMessage } from './AIMessage'
import { callGLMAPIStream, hasApiKey } from '@/services/ai.service'
import { clsx } from 'clsx'

export const AIChat: React.FC = () => {
  const [chatHistory, setChatHistory] = useAtom(aiChatHistoryAtom)
  const [input, setInput] = useAtom(aiInputAtom)
  const isStreaming = useAtomValue(aiIsStreamingAtom)
  const setIsStreaming = useSetAtom(aiIsStreamingAtom)
  const addMessage = useSetAtom(addAIMessageAtom)
  const updateLastMessage = useSetAtom(updateLastAIMessageAtom)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory])

  // 发送消息
  const handleSend = async () => {
    if (!input.trim() || isStreaming) return

    if (!hasApiKey()) {
      alert('请先配置 API Key')
      return
    }

    const userMessage = input.trim()
    setInput('')
    setChatHistory((prev) => [...prev])

    // 添加用户消息
    addMessage({
      role: 'user',
      content: userMessage,
    })

    // 添加空的助手消息
    addMessage({
      role: 'assistant',
      content: '',
    })

    setIsStreaming(true)

    // 构建消息历史（包含系统提示）
    const messages = [
      {
        id: 'system',
        role: 'system' as const,
        content: '你是一位专业的简历顾问和写作助手。请使用简洁专业的语言，帮助用户优化简历内容。',
        timestamp: Date.now(),
      },
      ...chatHistory,
      {
        id: Date.now().toString(),
        role: 'user' as const,
        content: userMessage,
        timestamp: Date.now(),
      },
    ]

    // 调用 AI API（流式）
    await callGLMAPIStream(
      messages,
      // onChunk
      (content) => {
        updateLastMessage((prev) => prev + content)
      },
      // onComplete
      () => {
        setIsStreaming(false)
      },
      // onError
      (error) => {
        console.error('AI Error:', error)
        updateLastMessage((prev) => prev + `\n\n❌ 错误：${error.message}`)
        setIsStreaming(false)
      }
    )
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg
              className="w-16 h-16 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <p className="text-sm">开始与 AI 对话</p>
            <p className="text-xs mt-2">我可以帮你优化简历内容</p>
          </div>
        ) : (
          chatHistory.map((message) => (
            <AIMessage key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
            className={clsx(
              'flex-1 min-h-[60px] max-h-[200px] px-4 py-3 rounded-lg border resize-none',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white'
            )}
            disabled={isStreaming}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className={clsx(
              'px-4 py-3 rounded-lg font-medium transition-colors',
              'bg-blue-500 text-white hover:bg-blue-600',
              'disabled:bg-gray-300 disabled:cursor-not-allowed',
              'dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-gray-700'
            )}
          >
            {isStreaming ? (
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
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
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          按 Enter 发送，Shift + Enter 换行
        </p>
      </div>
    </div>
  )
}
