/**
 * 可排序列表组件
 * 结合 DraggableItem 和 DropZone 实现列表排序
 */

import React, { useMemo } from 'react'
import { DraggableItem } from './DraggableItem'
import { DropZone } from './DropZone'
import { DragHandle } from './DragHandle'
import type { DropResult } from '@/types'

interface SortableListProps<T> {
  items: T[] | undefined
  itemType: string
  sectionType?: string
  renderItem: (item: T, index: number) => React.ReactNode
  onReorder: (fromIndex: number, toIndex: number) => void
  className?: string
  itemClassName?: string
  showDragHandle?: boolean
  dragHandlePosition?: 'left' | 'right'
}

export function SortableList<T extends { id?: string; type?: string }>({
  items,
  itemType,
  sectionType,
  renderItem,
  onReorder,
  className,
  itemClassName,
  showDragHandle = true,
  dragHandlePosition = 'left',
}: SortableListProps<T>) {
  // 处理 items 为 undefined 的情况
  const safeItems = items || []

  // 获取唯一 key 的函数
  const getItemKey = (item: T, index: number): string => {
    if (item.id) return item.id
    if (item.type) return item.type
    return `item-${index}`
  }

  // 使用 useMemo 创建稳定的 drop 处理函数
  const dropHandlers = useMemo(() => {
    return safeItems.map(() => {
      return (result: DropResult) => {
        // 只要有有效的 drop 操作就触发重新排序
        if (result.allowed && result.fromIndex !== undefined && result.fromIndex !== result.newIndex) {
          onReorder(result.fromIndex, result.newIndex)
        }
      }
    })
  }, [safeItems.length, onReorder])

  return (
    <div className={className}>
      {safeItems.map((item, index) => {
        const itemKey = getItemKey(item, index)
        return (
          <DropZone
            key={`zone-${itemKey}`}
            acceptedType={itemType}
            index={index}
            sectionType={sectionType}
            onDrop={dropHandlers[index]}
          >
            <DraggableItem className={itemClassName}>
              <div className="flex items-center gap-2">
                {showDragHandle && dragHandlePosition === 'left' && (
                  <DragHandle
                    id={itemKey}
                    type={itemType}
                    index={index}
                    sectionType={sectionType}
                  />
                )}
                <div className="flex-1">{renderItem(item, index)}</div>
                {showDragHandle && dragHandlePosition === 'right' && (
                  <DragHandle
                    id={itemKey}
                    type={itemType}
                    index={index}
                    sectionType={sectionType}
                  />
                )}
              </div>
            </DraggableItem>
          </DropZone>
        )
      })}
    </div>
  )
}
