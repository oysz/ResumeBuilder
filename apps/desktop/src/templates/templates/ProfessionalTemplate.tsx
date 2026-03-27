/**
 * 专业风格模板
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

export const ProfessionalTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
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
        <div className="max-w-4xl mx-auto bg-white p-8" style={{ gap: 'var(--section-spacing)' }}>
          <div className="bg-gray-800 text-white p-6 -mx-8 -mt-8">
            <h1 className="text-3xl font-bold mb-2">{personalInfo?.name || ''}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-300">
              {personalInfo?.email && <span>{personalInfo.email}</span>}
              {personalInfo?.phone && <span>{personalInfo.phone}</span>}
              {personalInfo?.location && <span>{personalInfo.location}</span>}
              {personalInfo?.website && (
                <a
                  href={personalInfo.website}
                  className="text-blue-300 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {personalInfo.website}
                </a>
              )}
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  className="text-blue-300 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.platform}
                </a>
              ))}
            </div>
          </div>

          {personalInfo?.summary && (
            <div className="p-4 bg-gray-50 border-l-4 border-gray-600">
              <p className="text-gray-700">{personalInfo.summary}</p>
            </div>
          )}

          {safeSections.map(renderSection)}
        </div>
      )
    }} />
  )
}
