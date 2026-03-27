/**
 * 现代风格模板
 */

import React from 'react'
import type { ResumeData } from '@/types'
import {
  ResumeHeader,
  EducationSection,
  ExperienceSection,
  SkillsSection,
  ProjectsSection,
  CertificationsSection,
  LanguagesSection,
  TemplateRenderer,
} from '../TemplateRenderer'

export const ModernTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, sections, settings } = data
  // 处理 sections 可能为 undefined 的情况
  const safeSections = sections || []

  // 按顺序渲染区块
  const renderSection = (section: any) => {
    if (!section.visible) return null

    switch (section.type) {
      case 'experience':
        return <ExperienceSection key={section.type} data={section.data || []} />
      case 'education':
        return <EducationSection key={section.type} data={section.data || []} />
      case 'projects':
        return <ProjectsSection key={section.type} data={section.data || []} />
      case 'skills':
        return <SkillsSection key={section.type} data={section.data || []} />
      case 'certifications':
        return <CertificationsSection key={section.type} data={section.data || []} />
      case 'languages':
        return <LanguagesSection key={section.type} data={section.data || []} />
      default:
        return null
    }
  }

  return (
    <TemplateRenderer data={data} renderContent={() => (
      <div className="max-w-4xl mx-auto bg-white p-8" style={{ gap: 'var(--section-spacing)' }}>
        <ResumeHeader personalInfo={personalInfo} showAvatar={settings?.showAvatar ?? true} />

        {safeSections.map(renderSection)}
      </div>
    )} />
  )
}
