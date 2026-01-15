/**
 * 简历预览组件
 */

import React, { useRef } from 'react'
import { useAtomValue } from 'jotai'
import { resumeDataAtom } from '@/store/atoms'
import { TemplateLoader } from '@/templates'

export const ResumePreview: React.FC = () => {
  const resumeData = useAtomValue(resumeDataAtom)
  const containerRef = useRef<HTMLDivElement>(null)

  // 处理 resumeData 可能为 undefined 的情况
  if (!resumeData) {
    return (
      <div className="h-full flex flex-col bg-gray-100">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="bg-white shadow-lg mx-auto p-8 text-center text-gray-500">
            加载中...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-100">
      <div className="flex-1 overflow-y-auto p-8">
        <div
          ref={containerRef}
          className="bg-white shadow-lg mx-auto"
          style={{ maxWidth: '210mm', minHeight: '297mm' }}
        >
          <TemplateLoader data={resumeData} />
        </div>
      </div>
    </div>
  )
}
