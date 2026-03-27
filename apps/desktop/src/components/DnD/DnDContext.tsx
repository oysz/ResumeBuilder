/**
 * 拖拽上下文组件
 * 使用 React DnD 提供拖拽功能
 */

import React, { createContext, useContext, ReactNode } from 'react'
import { DndProvider as ReactDndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

interface DnDContextValue {
  // 可以添加自定义的拖拽上下文状态
}

const DnDContext = createContext<DnDContextValue | undefined>(undefined)

export const useDnD = () => {
  const context = useContext(DnDContext)
  if (!context) {
    throw new Error('useDnD must be used within DnDProvider')
  }
  return context
}

interface DnDProviderProps {
  children: ReactNode
}

export const DnDProvider: React.FC<DnDProviderProps> = ({ children }) => {
  return (
    <ReactDndProvider backend={HTML5Backend}>
      <DnDContext.Provider value={{}}>{children}</DnDContext.Provider>
    </ReactDndProvider>
  )
}
