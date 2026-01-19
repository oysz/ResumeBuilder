/**
 * AI 消息组件
 */

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { ChatMessage } from '@/types/ai.types'
import { clsx } from 'clsx'

interface AIMessageProps {
  message: ChatMessage
}

export const AIMessage: React.FC<AIMessageProps> = ({ message }) => {
  const isUser = message.role === 'user'

  return (
    <div
      className={clsx(
        'flex w-full mb-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={clsx(
          'flex max-w-[80%] rounded-lg px-4 py-3',
          isUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none dark:bg-gray-800 dark:text-gray-100'
        )}
      >
        {!isUser && (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mr-2">
            <svg
              className="w-4 h-4 text-white"
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
        )}

        <div className="flex-1 overflow-hidden">
          {isUser ? (
            <p className="whitespace-pre-wrap break-words text-sm">
              {message.content}
            </p>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          <p className="text-xs opacity-60 mt-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  )
}
