/**
 * 放置区域组件
 */

import React, { useRef, useCallback } from 'react'
import { useDrop } from 'react-dnd'
import type { DropResult } from '@/types'
import clsx from 'clsx'

interface DropZoneProps {
  acceptedType: string
  index: number
  sectionType?: string
  onDrop: (result: DropResult) => void
  children: React.ReactNode
  className?: string
  isOverClassName?: string
  canDropClassName?: string
}

export const DropZone: React.FC<DropZoneProps> = ({
  acceptedType,
  index,
  sectionType,
  onDrop,
  children,
  className,
  isOverClassName = 'bg-blue-50 border-blue-300',
  canDropClassName = 'bg-gray-50',
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const onDropRef = useRef(onDrop)

  // 保持 onDropRef 最新
  onDropRef.current = onDrop

  // 创建稳定的 drop 处理函数
  const handleDrop = useCallback(
    (item: { id: string; type: string; index: number; sectionType?: string }) => {
      const result: DropResult = {
        allowed: true,
        fromIndex: item.index,
        newIndex: index,
        sectionType: sectionType as any,
      }
      onDropRef.current(result)
    },
    [index, sectionType]
  )

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: acceptedType,
      drop: handleDrop,
      canDrop: (item) => {
        return item.type === acceptedType && item.index !== index
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [acceptedType, handleDrop, index]
  )

  drop(ref)

  return (
    <div
      ref={ref}
      className={clsx(
        'transition-colors',
        isOver && canDrop && isOverClassName,
        !isOver && canDrop && canDropClassName,
        className
      )}
    >
      {children}
    </div>
  )
}
