/**
 * 模板渲染器
 * 处理简历模板的渲染和样式注入
 */

import React, { useMemo } from 'react'
import type { ResumeData, ResumeSettings } from '@/types'
import { DateUtils } from '@/utils'

interface TemplateRendererProps {
  data: ResumeData
  renderContent: (data: ResumeData) => React.ReactNode
  className?: string
}

// 字体映射
const fontClasses: Record<ResumeSettings['fontFamily'], string> = {
  inter: 'font-sans',
  roboto: 'font-roboto',
  opensans: 'font-opensans',
  lato: 'font-lato',
  merriweather: 'font-serif',
}

// 字号映射
const fontSizeClasses: Record<ResumeSettings['fontSize'], string> = {
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-lg',
}

// 间距映射
const spacingClasses: Record<number, string> = {
  0: 'space-y-1',
  1: 'space-y-2',
  2: 'space-y-3',
  3: 'space-y-4',
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  data,
  renderContent,
  className = '',
}) => {
  const computedClasses = useMemo(() => {
    // 处理 settings 可能为 undefined 的情况
    const settings = data.settings || { fontSize: 'medium', fontFamily: 'inter', spacing: 1, colorScheme: 'modern' }
    const { fontSize, fontFamily, spacing } = settings
    return {
      font: fontClasses[fontFamily],
      size: fontSizeClasses[fontSize],
      spacing: spacingClasses[Math.min(Math.max(spacing, 0), 3)] || spacingClasses[1],
    }
  }, [data.settings])

  const settings = data.settings || { colorScheme: 'modern', spacing: 1 }

  return (
    <div
      className={`template-wrapper ${computedClasses.font} ${computedClasses.size} ${computedClasses.spacing} ${className}`}
      style={{
        color: 'var(--text-color)',
      }}
      data-color-scheme={settings.colorScheme}
      data-spacing={settings.spacing}
    >
      {renderContent(data)}
    </div>
  )
}

// 公共组件 - 头部
export const ResumeHeader: React.FC<{
  personalInfo: ResumeData['personalInfo']
  showAvatar?: boolean
}> = ({ personalInfo, showAvatar = true }) => {
  // 处理 personalInfo 可能为 undefined 的情况
  if (!personalInfo) {
    return <header className="mb-6"></header>
  }

  // 处理社交链接
  const socialLinks = Array.isArray(personalInfo.socialLinks) ? personalInfo.socialLinks : []

  return (
    <header className="mb-6">
      <div className="flex items-start gap-4">
        {showAvatar && personalInfo.avatar && (
          <img
            src={personalInfo.avatar}
            alt={personalInfo.name || ''}
            className="w-20 h-20 rounded-full object-cover"
          />
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{personalInfo.name || ''}</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
            {personalInfo.email && (
              <a href={`mailto:${personalInfo.email}`} className="hover:text-blue-600">
                {personalInfo.email}
              </a>
            )}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.website && (
              <a
                href={personalInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600"
              >
                {personalInfo.website}
              </a>
            )}
            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600"
              >
                {link.platform}
              </a>
            ))}
          </div>
          {personalInfo.summary && (
            <p className="mt-3 text-gray-700">{personalInfo.summary}</p>
          )}
        </div>
      </div>
    </header>
  )
}

// 公共组件 - 区块标题
export const SectionTitle: React.FC<{ title: string }> = ({ title }) => {
  return (
    <h2
      className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-1 first:mt-0"
      style={{
        marginTop: 'var(--section-spacing)',
        marginBottom: 'calc(var(--item-spacing) * 0.75)',
      }}
    >
      {title}
    </h2>
  )
}

// 公共组件 - 教育经历
export const EducationSection: React.FC<{ data: ResumeData['sections'][number]['data'] }> = ({
  data,
}) => {
  const education = Array.isArray(data) ? data : []
  if (!education.length) return null

  return (
    <section>
      <SectionTitle title="教育经历" />
      <div className="space-y-3">
        {education.map((edu) => (
          <div key={edu.id}>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-gray-900">{edu.school}</div>
                <div className="text-sm text-gray-600">
                  {edu.degree} · {edu.major}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {DateUtils.formatDateRange(edu.startDate, edu.endDate, edu.current)}
              </div>
            </div>
            {edu.gpa && <div className="text-sm text-gray-600 mt-1">GPA: {edu.gpa}</div>}
            {edu.description && <p className="text-sm text-gray-700 mt-1">{edu.description}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}

// 公共组件 - 工作经历
export const ExperienceSection: React.FC<{ data: ResumeData['sections'][number]['data'] }> = ({
  data,
}) => {
  const experience = Array.isArray(data) ? data : []
  if (!experience.length) return null

  return (
    <section>
      <SectionTitle title="工作经历" />
      <div className="space-y-4">
        {experience.map((exp) => (
          <div key={exp.id}>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-gray-900">{exp.position}</div>
                <div className="text-sm text-gray-600">{exp.company}</div>
                {exp.location && <div className="text-sm text-gray-500">{exp.location}</div>}
              </div>
              <div className="text-sm text-gray-500">
                {DateUtils.formatDateRange(exp.startDate, exp.endDate, exp.current)}
              </div>
            </div>
            <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
            {exp.achievements.length > 0 && (
              <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                {exp.achievements.map((achievement: string, i: number) => (
                  <li key={i}>{achievement}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

// 公共组件 - 技能
export const SkillsSection: React.FC<{ data: ResumeData['sections'][number]['data'] }> = ({
  data,
}) => {
  const skills = Array.isArray(data) ? data : []
  if (!skills.length) return null

  return (
    <section>
      <SectionTitle title="专业技能" />
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill.id}
            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
          >
            {skill.name}
          </span>
        ))}
      </div>
    </section>
  )
}

// 公共组件 - 项目
export const ProjectsSection: React.FC<{ data: ResumeData['sections'][number]['data'] }> = ({
  data,
}) => {
  const projects = Array.isArray(data) ? data : []
  if (!projects.length) return null

  return (
    <section>
      <SectionTitle title="项目经历" />
      <div className="space-y-3">
        {projects.map((project) => (
          <div key={project.id}>
            <div className="flex justify-between items-start">
              <div className="font-medium text-gray-900">{project.name}</div>
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  查看项目
                </a>
              )}
            </div>
            <p className="text-sm text-gray-700 mt-1">{project.description}</p>
            {project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {project.technologies.map((tech: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
            {project.achievements.length > 0 && (
              <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                {project.achievements.map((achievement: string, i: number) => (
                  <li key={i}>{achievement}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

// 公共组件 - 证书
export const CertificationsSection: React.FC<{
  data: ResumeData['sections'][number]['data']
}> = ({ data }) => {
  const certifications = Array.isArray(data) ? data : []
  if (!certifications.length) return null

  return (
    <section>
      <SectionTitle title="证书荣誉" />
      <div className="space-y-2">
        {certifications.map((cert) => (
          <div key={cert.id} className="flex justify-between items-center text-sm">
            <div>
              <span className="font-medium text-gray-900">{cert.name}</span>
              <span className="text-gray-600 ml-2">{cert.issuer}</span>
            </div>
            <span className="text-gray-500">{DateUtils.formatDate(cert.date)}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

// 公共组件 - 语言能力
export const LanguagesSection: React.FC<{ data: ResumeData['sections'][number]['data'] }> = ({
  data,
}) => {
  const languages = Array.isArray(data) ? data : []
  if (!languages.length) return null

  const proficiencyLabels: Record<string, string> = {
    native: '母语',
    fluent: '流利',
    advanced: '高级',
    intermediate: '中级',
    basic: '基础',
  }

  return (
    <section>
      <SectionTitle title="语言能力" />
      <div className="space-y-2">
        {languages.map((lang) => (
          <div key={lang.id} className="flex justify-between items-center text-sm">
            <span className="text-gray-900">{lang.name}</span>
            <span className="text-gray-600">{proficiencyLabels[lang.proficiency]}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
