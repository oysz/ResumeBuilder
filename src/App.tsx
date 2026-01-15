/**
 * 主应用组件
 */

import React, { useState, useCallback, useEffect } from 'react'
import { useAtomValue } from 'jotai'
import { isEditorPanelOpenAtom } from '@/store/atoms'
import { DnDProvider } from '@/components/DnD'
import { Toolbar } from '@/components/Toolbar'
import { ResumeEditor } from '@/components/Editor'
import { ResumePreview } from '@/components/Preview'
import { useElectron } from '@/hooks/useElectron'

// 最小和最大宽度
const MIN_PANEL_WIDTH = 300
const MAX_PANEL_WIDTH = 600
const DEFAULT_PANEL_WIDTH = 384

export const App: React.FC = () => {
  const isEditorOpen = useAtomValue(isEditorPanelOpenAtom)
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH)
  const [isResizing, setIsResizing] = useState(false)

  // 初始化 Electron 功能
  useElectron()

  // 处理鼠标移动事件
  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = e.clientX
      // 限制宽度在最小和最大值之间
      const clampedWidth = Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, newWidth))
      setPanelWidth(clampedWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  // 开始调整大小
  const handleMouseDown = useCallback(() => {
    setIsResizing(true)
  }, [])

  return (
    <DnDProvider>
      <div className="h-screen flex flex-col bg-gray-50">
        <Toolbar />
        <div className="flex-1 flex overflow-hidden">
          {/* 编辑器面板 */}
          {isEditorOpen && (
            <>
              <div
                className="flex-shrink-0 border-r bg-white overflow-hidden"
                style={{ width: `${panelWidth}px`, minWidth: `${MIN_PANEL_WIDTH}px`, maxWidth: `${MAX_PANEL_WIDTH}px` }}
              >
                <ResumeEditor />
              </div>
              {/* 调整大小的分隔条 */}
              <div
                onMouseDown={handleMouseDown}
                className={`
                  relative flex-shrink-0 w-1.5 hover:w-2 bg-gray-200 hover:bg-blue-400 cursor-col-resize
                  transition-all duration-150
                  ${isResizing ? 'w-2 bg-blue-500' : ''}
                `}
              >
                {/* 拖拽手柄指示器 */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-0.5">
                  <div className={`w-0.5 h-4 rounded-full ${isResizing ? 'bg-white' : 'bg-gray-400'}`} />
                  <div className={`w-0.5 h-4 rounded-full ${isResizing ? 'bg-white' : 'bg-gray-400'}`} />
                </div>
              </div>
            </>
          )}

          {/* 预览面板 */}
          <div className="flex-1 overflow-hidden">
            <ResumePreview />
          </div>
        </div>
      </div>
    </DnDProvider>
  )
}
