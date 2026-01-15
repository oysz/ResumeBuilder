/**
 * 工具栏组件
 * 提供导出、保存、重置等操作
 */

import React from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { resumeDataAtom, resetResumeAtom, addVersionAtom } from '@/store/atoms'
import { ExportService } from '@/services'
import { autoSaveService } from '@/services/autoSave.service'

export const Toolbar: React.FC = () => {
  const resumeData = useAtomValue(resumeDataAtom)
  const resetResume = useSetAtom(resetResumeAtom)
  const addVersion = useSetAtom(addVersionAtom)

  const handleExportPDF = async () => {
    const previewElement = document.querySelector('[data-template]') as HTMLElement
    if (!previewElement) {
      alert('无法找到预览元素')
      return
    }

    const result = await ExportService.exportToPDF(previewElement, {
      filename: `${resumeData?.metadata.title || 'resume'}.pdf`,
    })

    if (result.success) {
      console.log('PDF 导出成功')
    } else {
      alert(`导出失败: ${result.error}`)
    }
  }

  const handleExportImage = async () => {
    const previewElement = document.querySelector('[data-template]') as HTMLElement
    if (!previewElement) {
      alert('无法找到预览元素')
      return
    }

    const result = await ExportService.exportToImage(previewElement, {
      filename: `${resumeData?.metadata.title || 'resume'}.png`,
    })

    if (result.success) {
      console.log('图片导出成功')
    } else {
      alert(`导出失败: ${result.error}`)
    }
  }

  const handlePrint = () => {
    const previewElement = document.querySelector('[data-template]') as HTMLElement
    if (!previewElement) {
      alert('无法找到预览元素')
      return
    }
    ExportService.print(previewElement)
  }

  const handleSaveVersion = () => {
    addVersion(`保存于 ${new Date().toLocaleString()}`)
    alert('版本已保存')
  }

  const handleReset = () => {
    if (confirm('确定要重置所有内容吗？此操作不可恢复。')) {
      resetResume()
    }
  }

  const handleExport = () => {
    if (!resumeData) return
    autoSaveService.exportToFile(resumeData, `${resumeData.metadata.title || 'resume'}.json`)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          const data = await autoSaveService.importFromFile(file)
          localStorage.setItem('resume-data', JSON.stringify(data))
          window.location.reload()
        } catch (error) {
          alert('导入失败: ' + (error instanceof Error ? error.message : '未知错误'))
        }
      }
    }
    input.click()
  }

  const handleClearData = () => {
    if (confirm('确定要清除所有数据吗？这将清除浏览器缓存中的所有简历数据，页面将重新加载。')) {
      localStorage.removeItem('resume-data')
      localStorage.removeItem('resume-versions')
      window.location.reload()
    }
  }

  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-blue-600"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z"
            clipRule="evenodd"
          />
        </svg>
        <h1 className="text-xl font-bold text-gray-900">简历生成器</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleImport}
          className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          导入
        </button>
        <button
          type="button"
          onClick={handleExport}
          className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          导出 JSON
        </button>
        <button
          type="button"
          onClick={handleSaveVersion}
          className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          保存版本
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          打印
        </button>
        <button
          type="button"
          onClick={handleExportImage}
          className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          导出图片
        </button>
        <button
          type="button"
          onClick={handleExportPDF}
          className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          导出 PDF
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100"
        >
          重置
        </button>
        <button
          type="button"
          onClick={handleClearData}
          className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
          title="清除浏览器缓存数据"
        >
          清除缓存
        </button>
      </div>
    </div>
  )
}
