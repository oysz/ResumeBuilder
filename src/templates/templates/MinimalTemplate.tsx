/**
 * 极简风格模板
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

export const MinimalTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
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
    <TemplateRenderer data={data} renderContent={() => {
      const socialLinks = Array.isArray(personalInfo?.socialLinks) ? personalInfo.socialLinks : []

      return (
        <div className="max-w-3xl mx-auto bg-white p-8" style={{ gap: 'var(--section-spacing)' }}>
          <header>
            <h1 className="text-3xl font-light text-gray-900 mb-4">{personalInfo?.name || ''}</h1>
            <div className="text-sm text-gray-500 space-y-1">
              {personalInfo?.email && <div>{personalInfo.email}</div>}
              {personalInfo?.phone && <div>{personalInfo.phone}</div>}
              {personalInfo?.location && <div>{personalInfo.location}</div>}
              {personalInfo?.website && <div><a href={personalInfo.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">{personalInfo.website}</a></div>}
              {socialLinks.map((link) => (
                <div key={link.id}><a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">{link.platform}</a></div>
              ))}
            </div>
          </header>

          {personalInfo?.summary && (
            <p className="text-gray-600 leading-relaxed font-light">{personalInfo.summary}</p>
          )}

          {safeSections.map(renderSection)}
        </div>
      )
    }} />
  )
}
