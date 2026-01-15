/**
 * 通用区块编辑器
 * 支持教育经历、工作经历、项目等区块的编辑
 */

import React, { useCallback } from 'react'
import { useAtom } from 'jotai'
import { sectionsAtom } from '@/store/atoms'
import clsx from 'clsx'
import type { SectionType, ResumeSection } from '@/types'

interface SectionEditorProps {
  sectionType: SectionType
  title: string
  renderForm: (data: any, onChange: (field: string, value: any) => void) => React.ReactNode
  createNewItem: () => any
  getItemTitle?: (item: any) => string
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  sectionType,
  title,
  renderForm,
  createNewItem,
  getItemTitle,
}) => {
  const [sections, setSections] = useAtom(sectionsAtom)
  // 处理 sections 可能为 undefined 的情况
  const safeSections: ResumeSection[] = Array.isArray(sections) ? sections : []
  const section = safeSections.find((s) => s.type === sectionType)
  const sectionData = Array.isArray(section?.data) ? section.data : []

  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [isEditMode, setIsEditMode] = React.useState(false)
  const [localItems, setLocalItems] = React.useState<any[]>([])

  const addItem = useCallback(() => {
    const newItem = createNewItem()
    setLocalItems((prev) => [...prev, { ...newItem, isEditing: true }])
    setEditingId(newItem.id)
    setIsEditMode(false)
  }, [createNewItem])

  const editItem = useCallback((item: any) => {
    setLocalItems((prev) => {
      // 检查是否已经在编辑该项目
      const existingIndex = prev.findIndex((i) => i.id === item.id)
      if (existingIndex >= 0) {
        // 已经在编辑，不做任何改变
        return prev
      }
      // 不在编辑状态，添加到编辑列表
      return [...prev, { ...item, isEditing: true }]
    })
    setEditingId(item.id)
    setIsEditMode(true)
  }, [])

  const updateItem = useCallback((id: string, field: string, value: any) => {
    setLocalItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }, [])

  const saveItem = useCallback(
    (id: string) => {
      const item = localItems.find((i) => i.id === id)
      if (item) {
        setSections((prevSections) => {
          const currentSections: ResumeSection[] = Array.isArray(prevSections) ? prevSections : []
          const { isEditing, ...itemData } = item

          // 找到要更新的区块索引
          const sectionIndex = currentSections.findIndex((s) => s.type === sectionType)

          if (sectionIndex >= 0) {
            // 区块已存在，更新数据
            const newSections = [...currentSections]
            const existingData = Array.isArray(newSections[sectionIndex].data)
              ? newSections[sectionIndex].data
              : []

            if (isEditMode) {
              // 编辑模式：替换现有项目
              const dataIndex = existingData.findIndex((d) => d.id === id)
              if (dataIndex >= 0) {
                existingData[dataIndex] = itemData
              }
              newSections[sectionIndex] = {
                ...newSections[sectionIndex],
                data: [...existingData],
              }
            } else {
              // 新增模式：添加新项目
              newSections[sectionIndex] = {
                ...newSections[sectionIndex],
                data: [...existingData, itemData],
              }
            }
            return newSections
          } else {
            // 区块不存在，创建新区块
            const newSection: ResumeSection = {
              type: sectionType,
              title,
              data: [itemData],
              visible: true,
              order: currentSections.length,
            }
            return [...currentSections, newSection]
          }
        })
        setLocalItems((prev) => prev.filter((i) => i.id !== id))
        setEditingId(null)
        setIsEditMode(false)
      }
    },
    [localItems, sectionType, title, setSections, isEditMode]
  )

  const cancelEdit = useCallback((id: string) => {
    setLocalItems((prev) => prev.filter((i) => i.id !== id))
    setEditingId(null)
    setIsEditMode(false)
  }, [])

  const deleteItem = useCallback(
    (id: string) => {
      if (confirm('确定要删除这项内容吗？')) {
        setSections((prevSections) => {
          const currentSections: ResumeSection[] = Array.isArray(prevSections) ? prevSections : []
          const sectionIndex = currentSections.findIndex((s) => s.type === sectionType)

          if (sectionIndex >= 0) {
            const newSections = [...currentSections]
            const existingData = Array.isArray(newSections[sectionIndex].data)
              ? newSections[sectionIndex].data
              : []
            newSections[sectionIndex] = {
              ...newSections[sectionIndex],
              data: existingData.filter((item) => item.id !== id),
            }
            return newSections
          }
          return currentSections
        })
      }
    },
    [setSections, sectionType]
  )

  // 获取项目标题的辅助函数
  const getDefaultTitle = useCallback((item: any) => {
    if (sectionType === 'education') {
      return item.school || item.degree || '未命名教育经历'
    } else if (sectionType === 'experience') {
      return item.company || item.position || '未命名工作经历'
    } else if (sectionType === 'skills') {
      return item.name || '未命名技能'
    }
    return '未命名项目'
  }, [sectionType])

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-md font-medium text-gray-900">{title}</h4>
        <button
          type="button"
          onClick={addItem}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + 添加
        </button>
      </div>

      {/* 显示已保存的项目列表 */}
      {sectionData.length > 0 && (
        <div className="space-y-2 mb-4">
          {sectionData.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-white border rounded-md hover:bg-gray-50"
            >
              <span className="text-sm text-gray-700">
                {getItemTitle ? getItemTitle(item) : getDefaultTitle(item)}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => editItem(item)}
                  className="px-3 py-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-600 rounded hover:bg-blue-50"
                >
                  编辑
                </button>
                <button
                  type="button"
                  onClick={() => deleteItem(item.id)}
                  className="px-3 py-1 text-xs text-red-600 hover:text-red-800 border border-red-600 rounded hover:bg-red-50"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 编辑/新增表单 */}
      <div className="space-y-4">
        {localItems.map((item) => (
          <div
            key={item.id}
            className={clsx(
              'border rounded-lg p-4 bg-gray-50',
              editingId === item.id && 'ring-2 ring-blue-500'
            )}
          >
            {renderForm(item, (field, value) => updateItem(item.id, field, value))}
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => saveItem(item.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                {isEditMode ? '更新' : '保存'}
              </button>
              <button
                type="button"
                onClick={() => cancelEdit(item.id)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                取消
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 预设的表单组件
export const EducationForm: React.FC<{
  data: any
  onChange: (field: string, value: any) => void
}> = React.memo(({ data, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">学校名称 *</label>
        <input
          type="text"
          value={data.school || ''}
          onChange={(e) => onChange('school', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="请输入学校名称"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">学位 *</label>
        <input
          type="text"
          value={data.degree || ''}
          onChange={(e) => onChange('degree', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="如: 学士、硕士、博士"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">专业 *</label>
        <input
          type="text"
          value={data.major || ''}
          onChange={(e) => onChange('major', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="请输入专业"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
        <input
          type="text"
          value={data.gpa || ''}
          onChange={(e) => onChange('gpa', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="如: 3.8/4.0"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">开始日期 *</label>
        <input
          type="month"
          value={data.startDate || ''}
          onChange={(e) => onChange('startDate', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
        <input
          type="month"
          value={data.endDate || ''}
          onChange={(e) => onChange('endDate', e.target.value)}
          disabled={data.current}
          className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
        />
      </div>
      <div className="col-span-2 flex items-center">
        <input
          type="checkbox"
          id="current"
          checked={data.current || false}
          onChange={(e) => onChange('current', e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="current" className="text-sm text-gray-700">
          目前在读
        </label>
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
        <textarea
          value={data.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="在校经历、荣誉等"
        />
      </div>
    </div>
  )
})

export const ExperienceForm: React.FC<{
  data: any
  onChange: (field: string, value: any) => void
}> = React.memo(({ data, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">公司名称 *</label>
        <input
          type="text"
          value={data.company || ''}
          onChange={(e) => onChange('company', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="请输入公司名称"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">职位 *</label>
        <input
          type="text"
          value={data.position || ''}
          onChange={(e) => onChange('position', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="请输入职位"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">工作地点</label>
        <input
          type="text"
          value={data.location || ''}
          onChange={(e) => onChange('location', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="城市, 国家"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">开始日期 *</label>
        <input
          type="month"
          value={data.startDate || ''}
          onChange={(e) => onChange('startDate', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
        <input
          type="month"
          value={data.endDate || ''}
          onChange={(e) => onChange('endDate', e.target.value)}
          disabled={data.current}
          className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
        />
      </div>
      <div className="col-span-2 flex items-center">
        <input
          type="checkbox"
          id="current-exp"
          checked={data.current || false}
          onChange={(e) => onChange('current', e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="current-exp" className="text-sm text-gray-700">
          目前在职
        </label>
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">工作描述 *</label>
        <textarea
          value={data.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="简要描述你的工作职责"
        />
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          工作成就 (每行一项)
        </label>
        <textarea
          value={(data.achievements || []).join('\n')}
          onChange={(e) =>
            onChange('achievements', e.target.value.split('\n').filter((a) => a.trim()))
          }
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="列出你的主要工作成就..."
        />
      </div>
    </div>
  )
})

export const SkillForm: React.FC<{
  data: any
  onChange: (field: string, value: any) => void
}> = React.memo(({ data, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">技能名称 *</label>
        <input
          type="text"
          value={data.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="如: JavaScript, Python"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">熟练度</label>
        <select
          value={data.level || 3}
          onChange={(e) => onChange('level', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value={1}>入门</option>
          <option value={2}>初级</option>
          <option value={3}>中级</option>
          <option value={4}>高级</option>
          <option value={5}>专家</option>
        </select>
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
        <input
          type="text"
          value={data.category || ''}
          onChange={(e) => onChange('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="如: 前端, 后端, 设计"
        />
      </div>
    </div>
  )
})

export const ProjectsForm: React.FC<{
  data: any
  onChange: (field: string, value: any) => void
}> = React.memo(({ data, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">项目名称 *</label>
        <input
          type="text"
          value={data.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="请输入项目名称"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">项目角色</label>
        <input
          type="text"
          value={data.role || ''}
          onChange={(e) => onChange('role', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="如: 负责人、开发者"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">开始日期 *</label>
        <input
          type="month"
          value={data.startDate || ''}
          onChange={(e) => onChange('startDate', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
        <input
          type="month"
          value={data.endDate || ''}
          onChange={(e) => onChange('endDate', e.target.value)}
          disabled={data.current}
          className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
        />
      </div>
      <div className="col-span-2 flex items-center">
        <input
          type="checkbox"
          id="current-project"
          checked={data.current || false}
          onChange={(e) => onChange('current', e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="current-project" className="text-sm text-gray-700">
          进行中
        </label>
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">项目链接</label>
        <input
          type="url"
          value={data.url || ''}
          onChange={(e) => onChange('url', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="https://github.com/username/project"
        />
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">项目描述 *</label>
        <textarea
          value={data.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="简要描述项目的目标和功能"
        />
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          技术栈 (逗号分隔)
        </label>
        <input
          type="text"
          value={(data.technologies || []).join(', ')}
          onChange={(e) => onChange('technologies', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="如: React, TypeScript, Node.js"
        />
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          项目成就 (每行一项)
        </label>
        <textarea
          value={(data.achievements || []).join('\n')}
          onChange={(e) => onChange('achievements', e.target.value.split('\n').filter(a => a.trim()))}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="列出项目的主要成就..."
        />
      </div>
    </div>
  )
})

export const CertificationsForm: React.FC<{
  data: any
  onChange: (field: string, value: any) => void
}> = React.memo(({ data, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">证书名称 *</label>
        <input
          type="text"
          value={data.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="如: AWS 认证解决方案架构师"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">颁发机构 *</label>
        <input
          type="text"
          value={data.issuer || ''}
          onChange={(e) => onChange('issuer', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="如: Amazon Web Services"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">获得日期 *</label>
        <input
          type="month"
          value={data.date || ''}
          onChange={(e) => onChange('date', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">证书编号</label>
        <input
          type="text"
          value={data.credentialId || ''}
          onChange={(e) => onChange('credentialId', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="证书的编号或 ID"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">证书链接</label>
        <input
          type="url"
          value={data.url || ''}
          onChange={(e) => onChange('url', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="验证证书的 URL"
        />
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
        <textarea
          value={data.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="证书的相关信息或备注"
        />
      </div>
    </div>
  )
})

export const LanguagesForm: React.FC<{
  data: any
  onChange: (field: string, value: any) => void
}> = React.memo(({ data, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">语言名称 *</label>
        <input
          type="text"
          value={data.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="如: 英语、日语"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">熟练度 *</label>
        <select
          value={data.proficiency || 'intermediate'}
          onChange={(e) => onChange('proficiency', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="native">母语</option>
          <option value="fluent">流利</option>
          <option value="advanced">高级</option>
          <option value="intermediate">中级</option>
          <option value="basic">基础</option>
        </select>
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">证书/成绩</label>
        <input
          type="text"
          value={data.certificate || ''}
          onChange={(e) => onChange('certificate', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="如: TOEFL 100分, JLPT N1"
        />
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
        <textarea
          value={data.notes || ''}
          onChange={(e) => onChange('notes', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="其他相关信息"
        />
      </div>
    </div>
  )
})
