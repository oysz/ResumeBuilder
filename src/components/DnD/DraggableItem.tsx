/**
 * 可拖拽项组件 - 简化为容器组件
 * 实际的拖拽逻辑由 DragHandle 处理
 */

import React from 'react'
import clsx from 'clsx'

interface DraggableItemProps {
  children: React.ReactNode
  className?: string
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  children,
  className,
}) => {
  return <div className={clsx('transition-opacity', className)}>{children}</div>
}
