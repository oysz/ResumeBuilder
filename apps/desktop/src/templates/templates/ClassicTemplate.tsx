/**
 * 经典风格模板
 */

import React from 'react'
import type { ResumeData } from '@/types'
import {
  EducationSection,
  ExperienceSection,
  SkillsSection,
  ProjectsSection,
  CertificationsSection,
  LanguagesSection,
  TemplateRenderer,
} from '../TemplateRenderer'

export const ClassicTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, sections } = data
  const safeSections = sections || []

  // 按顺序渲染区块
  const renderSection = (section: any) => {
    if (!section.visible) return null

    switch (section.type) {
      case 'experience':
        return <ExperienceSection key={section.type} data={section.data || []} />
      case 'education':
        return <EducationSection key={section.type} data={section.data || []} />
      case 'skills':
        return <SkillsSection key={section.type} data={section.data || []} />
      case 'projects':
        return <ProjectsSection key={section.type} data={section.data || []} />
      case 'certifications':
        return <CertificationsSection key={section.type} data={section.data || []} />
      case 'languages':
        return <LanguagesSection key={section.type} data={section.data || []} />
      default:
        return null
    }
  }

  return (
    <TemplateRenderer data={data} renderContent={() => {
      const socialLinks = Array.isArray(personalInfo?.socialLinks) ? personalInfo.socialLinks : []

      return (
        <div className="max-w-4xl mx-auto bg-white p-10 border-2 border-gray-300" style={{ gap: 'var(--section-spacing)' }}>
          <div className="text-center border-b-2 border-gray-800 pb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{personalInfo?.name || ''}</h1>
            <div className="flex justify-center flex-wrap gap-4 text-sm text-gray-700">
              {personalInfo?.email && <span>{personalInfo.email}</span>}
              {personalInfo?.phone && <span>| {personalInfo.phone}</span>}
              {personalInfo?.location && <span>| {personalInfo.location}</span>}
              {personalInfo?.website && <span>| <a href={personalInfo.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">{personalInfo.website}</a></span>}
              {socialLinks.map((link) => (
                <span key={link.id}>| <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">{link.platform}</a></span>
              ))}
            </div>
          </div>

          {personalInfo?.summary && (
            <p className="text-gray-700 leading-relaxed">{personalInfo.summary}</p>
          )}

          {safeSections.map(renderSection)}
        </div>
      )
    }} />
  )
}
