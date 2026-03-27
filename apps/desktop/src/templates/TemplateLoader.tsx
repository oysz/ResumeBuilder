/**
 * 模板加载器
 * 动态加载和渲染简历模板
 */

import React from 'react'
import type { ResumeData, Template } from '@/types'
import { ModernTemplate } from './templates/ModernTemplate'
import { ClassicTemplate } from './templates/ClassicTemplate'
import { MinimalTemplate } from './templates/MinimalTemplate'
import { ProfessionalTemplate } from './templates/ProfessionalTemplate'

interface TemplateLoaderProps {
  data: ResumeData
  templateId?: string
  className?: string
}

export const TemplateLoader: React.FC<TemplateLoaderProps> = ({
  data,
  templateId,
  className = '',
}) => {
  const template = templateId || data.settings.template || 'modern'

  const renderTemplate = () => {
    switch (template) {
      case 'modern':
        return <ModernTemplate data={data} />
      case 'classic':
        return <ClassicTemplate data={data} />
      case 'minimal':
        return <MinimalTemplate data={data} />
      case 'professional':
        return <ProfessionalTemplate data={data} />
      default:
        return <ModernTemplate data={data} />
    }
  }

  return (
    <div className={`template-container ${className}`} data-template={template}>
      {renderTemplate()}
    </div>
  )
}

// 可用模板列表
export const AVAILABLE_TEMPLATES: Template[] = [
  {
    id: 'modern',
    name: '现代风格',
    description: '清新现代的设计风格，适合创意行业',
    thumbnail: '/templates/modern-thumb.png',
    preview: '/templates/modern-preview.png',
    category: 'modern',
    settings: {
      fontSize: 'medium',
      fontFamily: 'inter',
      colorScheme: 'modern',
      spacing: 1,
    },
  },
  {
    id: 'classic',
    name: '经典风格',
    description: '传统专业的简历布局，适合商务场景',
    thumbnail: '/templates/classic-thumb.png',
    preview: '/templates/classic-preview.png',
    category: 'classic',
    settings: {
      fontSize: 'medium',
      fontFamily: 'opensans',
      colorScheme: 'classic',
      spacing: 1,
    },
  },
  {
    id: 'minimal',
    name: '极简风格',
    description: '简洁大方的排版，突出内容本身',
    thumbnail: '/templates/minimal-thumb.png',
    preview: '/templates/minimal-preview.png',
    category: 'modern',
    settings: {
      fontSize: 'medium',
      fontFamily: 'inter',
      colorScheme: 'minimal',
      spacing: 0,
    },
  },
  {
    id: 'professional',
    name: '专业风格',
    description: '稳重专业的视觉风格，适合管理层',
    thumbnail: '/templates/professional-thumb.png',
    preview: '/templates/professional-preview.png',
    category: 'professional',
    settings: {
      fontSize: 'medium',
      fontFamily: 'lato',
      colorScheme: 'professional',
      spacing: 1,
    },
  },
]
