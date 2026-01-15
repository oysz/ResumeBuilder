/**
 * 简历编辑器主面板
 */

import React, { useCallback } from 'react'
import { PersonalInfoEditor } from './PersonalInfoEditor'
import { SectionEditor, EducationForm, ExperienceForm, SkillForm, ProjectsForm, CertificationsForm, LanguagesForm } from './SectionEditor'
import { TemplateSelector } from './TemplateSelector'
import { SettingsPanel } from './SettingsPanel'
import { useAtom } from 'jotai'
import { sectionsAtom } from '@/store/atoms'
import { SortableList } from '../DnD'
import { v4 as uuidv4 } from 'uuid'
import type { ResumeSection } from '@/types'

export const ResumeEditor: React.FC = () => {
  const [sections, setSections] = useAtom(sectionsAtom)
  const [activeTab, setActiveTab] = React.useState<'content' | 'template' | 'settings'>(
    'content'
  )

  const handleSectionReorder = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return

    setSections((prevSections) => {
      // 确保我们有正确的数据结构
      if (!Array.isArray(prevSections)) {
        console.error('handleSectionReorder: prevSections is not an array:', prevSections)
        return []
      }
      const newSections = prevSections.map((section) => ({ ...section }))
      const [moved] = newSections.splice(fromIndex, 1)
      newSections.splice(toIndex, 0, moved)
      return newSections.map((section, index) => ({
        ...section,
        order: index,
      }))
    })
  }, [setSections])

  const toggleSectionVisibility = useCallback((sectionType: string) => {
    setSections((prevSections) => {
      // 确保我们有正确的数据结构
      if (!Array.isArray(prevSections)) {
        console.error('toggleSectionVisibility: prevSections is not an array:', prevSections)
        return []
      }
      return prevSections.map((s) =>
        s.type === sectionType ? { ...s, visible: !s.visible } : { ...s }
      )
    })
  }, [setSections])

  const createEducation = () => ({
    id: uuidv4(),
    school: '',
    degree: '',
    major: '',
    startDate: '',
    endDate: '',
    current: false,
    gpa: '',
    description: '',
  })

  const createExperience = () => ({
    id: uuidv4(),
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    current: false,
    location: '',
    description: '',
    achievements: [],
  })

  const createSkill = () => ({
    id: uuidv4(),
    name: '',
    level: 3,
    category: '',
  })

  const createProject = () => ({
    id: uuidv4(),
    name: '',
    role: '',
    startDate: '',
    endDate: '',
    current: false,
    url: '',
    description: '',
    technologies: [],
    achievements: [],
  })

  const createCertification = () => ({
    id: uuidv4(),
    name: '',
    issuer: '',
    date: '',
    credentialId: '',
    url: '',
    description: '',
  })

  const createLanguage = () => ({
    id: uuidv4(),
    name: '',
    proficiency: 'intermediate',
    certificate: '',
    notes: '',
  })

  // 确保 sections 始终是数组
  const safeSections: ResumeSection[] = Array.isArray(sections) ? sections : []

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 标签页导航 */}
      <div className="flex border-b">
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`
            flex-1 py-3 text-center font-medium transition-colors
            ${
              activeTab === 'content'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          内容编辑
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('template')}
          className={`
            flex-1 py-3 text-center font-medium transition-colors
            ${
              activeTab === 'template'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          模板选择
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`
            flex-1 py-3 text-center font-medium transition-colors
            ${
              activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          样式设置
        </button>
      </div>

      {/* 标签页内容 */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'content' && (
          <div className="space-y-6">
            <PersonalInfoEditor />

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">区块顺序</h3>
              <div className="border rounded-lg p-4">
                <SortableList
                  items={safeSections}
                  itemType="section"
                  renderItem={(section) => (
                    <div className="flex items-center justify-between p-3 bg-white border rounded-md">
                      <span className="font-medium">{section.title}</span>
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={section.visible}
                          onChange={() => toggleSectionVisibility(section.type)}
                          className="mr-2"
                        />
                        显示
                      </label>
                    </div>
                  )}
                  onReorder={handleSectionReorder}
                  itemClassName="mb-2"
                  showDragHandle={true}
                />
              </div>
            </div>

            <SectionEditor
              sectionType="education"
              title="教育经历"
              renderForm={(data, onChange) => <EducationForm data={data} onChange={onChange} />}
              createNewItem={createEducation}
              getItemTitle={(item) => `${item.school || ''} ${item.degree || ''}`.trim() || '教育经历'}
            />

            <SectionEditor
              sectionType="experience"
              title="工作经历"
              renderForm={(data, onChange) => <ExperienceForm data={data} onChange={onChange} />}
              createNewItem={createExperience}
              getItemTitle={(item) => `${item.company || ''} ${item.position || ''}`.trim() || '工作经历'}
            />

            <SectionEditor
              sectionType="skills"
              title="专业技能"
              renderForm={(data, onChange) => <SkillForm data={data} onChange={onChange} />}
              createNewItem={createSkill}
              getItemTitle={(item) => item.name || '技能'}
            />

            <SectionEditor
              sectionType="projects"
              title="项目经历"
              renderForm={(data, onChange) => <ProjectsForm data={data} onChange={onChange} />}
              createNewItem={createProject}
              getItemTitle={(item) => item.name || '项目'}
            />

            <SectionEditor
              sectionType="certifications"
              title="证书荣誉"
              renderForm={(data, onChange) => <CertificationsForm data={data} onChange={onChange} />}
              createNewItem={createCertification}
              getItemTitle={(item) => item.name || '证书'}
            />

            <SectionEditor
              sectionType="languages"
              title="语言能力"
              renderForm={(data, onChange) => <LanguagesForm data={data} onChange={onChange} />}
              createNewItem={createLanguage}
              getItemTitle={(item) => item.name || '语言'}
            />
          </div>
        )}

        {activeTab === 'template' && <TemplateSelector />}

        {activeTab === 'settings' && <SettingsPanel />}
      </div>
    </div>
  )
}
