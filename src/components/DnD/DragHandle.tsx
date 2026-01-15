/**
 * 拖拽手柄组件
 * 用于指示可拖拽的元素，并实际处理拖拽
 */

import React, { useRef } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import clsx from 'clsx'
import type { DragItem } from '@/types'

interface DragHandleProps {
  id: string
  type: string
  index: number
  sectionType?: string
  className?: string
  onDragStart?: () => void
  onDragEnd?: () => void
}

export const DragHandle: React.FC<DragHandleProps> = ({
  id,
  type,
  index,
  sectionType,
  className,
  onDragStart,
  onDragEnd,
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type,
      item: () => {
        onDragStart?.()
        return { id, type, index, sectionType } as DragItem
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: () => {
        onDragEnd?.()
      },
    }),
    [id, type, index, sectionType, onDragStart, onDragEnd]
  )

  // 隐藏默认拖拽预览
  preview(getEmptyImage(), { captureDraggingState: true })

  drag(ref)

  return (
    <div
      ref={ref}
      className={clsx(
        'flex items-center justify-center cursor-grab active:cursor-grabbing',
        'text-gray-400 hover:text-gray-600',
        'transition-colors duration-200',
        isDragging && 'opacity-50',
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  )
}
