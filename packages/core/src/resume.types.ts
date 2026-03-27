/**
 * 简历数据模型和类型定义
 * 包含简历的所有数据结构和验证规则
 */

import { z } from 'zod'

// ============ 基础类型 ============

export type SectionType =
  | 'personalInfo'
  | 'education'
  | 'experience'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages'

export type FontFamily = 'inter' | 'roboto' | 'opensans' | 'lato' | 'merriweather'
export type FontSize = 'small' | 'medium' | 'large'
export type ColorScheme = 'modern' | 'classic' | 'minimal' | 'professional'

// ============ 个人信息 ============

export interface SocialLink {
  id: string
  platform: string
  url: string
  icon?: string
}

export interface PersonalInfo {
  name: string
  email: string
  phone: string
  location: string
  website?: string
  socialLinks: SocialLink[]
  summary?: string
  avatar?: string
}

// ============ 教育经历 ============

export interface Education {
  id: string
  school: string
  degree: string
  major: string
  startDate: string
  endDate?: string
  current: boolean
  gpa?: string
  description?: string
}

// ============ 工作经历 ============

export interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate?: string
  current: boolean
  location?: string
  description: string
  achievements: string[]
}

// ============ 技能 ============

export interface Skill {
  id: string
  name: string
  level: 1 | 2 | 3 | 4 | 5
  category?: string
}

// ============ 项目经历 ============

export interface Project {
  id: string
  name: string
  description: string
  startDate?: string
  endDate?: string
  technologies: string[]
  url?: string
  achievements: string[]
}

// ============ 证书 ============

export interface Certification {
  id: string
  name: string
  issuer: string
  date: string
  url?: string
  credentialId?: string
}

// ============ 语言能力 ============

export interface Language {
  id: string
  name: string
  proficiency: 'native' | 'fluent' | 'advanced' | 'intermediate' | 'basic'
}

// ============ 简历区块 ============

export interface ResumeSection<T = any> {
  type: SectionType
  title: string
  data: T[]
  visible: boolean
  order: number
}

// ============ 简历设置 ============

export interface ResumeSettings {
  fontSize: FontSize
  fontFamily: FontFamily
  colorScheme: ColorScheme
  spacing: number
  showAvatar: boolean
  template: string
}

// ============ 简历元数据 ============

export interface ResumeMetadata {
  id: string
  title: string
  lastModified: number
  createdAt: number
  version: number
}

// ============ 完整简历数据 ============

export interface ResumeData {
  metadata: ResumeMetadata
  personalInfo: PersonalInfo
  sections: ResumeSection[]
  settings: ResumeSettings
}

// ============ 拖拽相关类型 ============

export interface DragItem {
  id: string
  type: string
  index: number
  sectionType?: SectionType
}

export interface DropResult {
  allowed: boolean
  fromIndex?: number
  newIndex: number
  sectionType?: SectionType
}

export interface DragContext {
  draggedItem: DragItem | null
  dropTarget: DropResult | null
  isDragging: boolean
}

// ============ 模板相关 ============

export interface Template {
  id: string
  name: string
  description: string
  thumbnail: string
  preview: string
  category: 'modern' | 'classic' | 'creative' | 'professional'
  settings: Partial<ResumeSettings>
}

// ============ 导出相关 ============

export interface ExportOptions {
  format: 'pdf' | 'png' | 'jpg'
  quality: number
  pageSize: 'A4' | 'letter'
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
  filename: string
}

export interface ExportResult {
  success: boolean
  url?: string
  blob?: Blob
  error?: string
}

// ============ 版本控制 ============

export interface VersionSnapshot {
  id: string
  timestamp: number
  data: ResumeData
  description?: string
}

export interface VersionHistory {
  current: number
  versions: VersionSnapshot[]
  maxVersions: number
}

// ============ Zod 验证模式 ============

export const SocialLinkSchema = z.object({
  id: z.string().uuid(),
  platform: z.string().min(1, '平台名称不能为空'),
  url: z.string().url('请输入有效的URL'),
  icon: z.string().optional(),
})

export const PersonalInfoSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  email: z.string().email('请输入有效的邮箱地址'),
  phone: z.string().min(1, '电话号码不能为空'),
  location: z.string().min(1, '所在地不能为空'),
  website: z.string().url('请输入有效的网站URL').optional().or(z.literal('')),
  socialLinks: z.array(SocialLinkSchema),
  summary: z.string().optional(),
  avatar: z.string().optional(),
})

export const EducationSchema = z.object({
  id: z.string().uuid(),
  school: z.string().min(1, '学校名称不能为空'),
  degree: z.string().min(1, '学位不能为空'),
  major: z.string().min(1, '专业不能为空'),
  startDate: z.string().min(1, '开始日期不能为空'),
  endDate: z.string().optional(),
  current: z.boolean(),
  gpa: z.string().optional(),
  description: z.string().optional(),
}).refine(
  (data) => data.current || !!data.endDate,
  '结束日期或当前在读必须选择一个'
)

export const ExperienceSchema = z.object({
  id: z.string().uuid(),
  company: z.string().min(1, '公司名称不能为空'),
  position: z.string().min(1, '职位不能为空'),
  startDate: z.string().min(1, '开始日期不能为空'),
  endDate: z.string().optional(),
  current: z.boolean(),
  location: z.string().optional(),
  description: z.string().min(1, '工作描述不能为空'),
  achievements: z.array(z.string()),
}).refine(
  (data) => data.current || !!data.endDate,
  '结束日期或当前在职必须选择一个'
)

export const SkillSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, '技能名称不能为空'),
  level: z.number().int().min(1).max(5),
  category: z.string().optional(),
})

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, '项目名称不能为空'),
  description: z.string().min(1, '项目描述不能为空'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  technologies: z.array(z.string()),
  url: z.string().url('请输入有效的URL').optional().or(z.literal('')),
  achievements: z.array(z.string()),
})

export const CertificationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, '证书名称不能为空'),
  issuer: z.string().min(1, '颁发机构不能为空'),
  date: z.string().min(1, '获得日期不能为空'),
  url: z.string().url('请输入有效的URL').optional().or(z.literal('')),
  credentialId: z.string().optional(),
})

export const LanguageSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, '语言名称不能为空'),
  proficiency: z.enum(['native', 'fluent', 'advanced', 'intermediate', 'basic']),
})

export const ResumeSettingsSchema = z.object({
  fontSize: z.enum(['small', 'medium', 'large']),
  fontFamily: z.enum(['inter', 'roboto', 'opensans', 'lato', 'merriweather']),
  colorScheme: z.enum(['modern', 'classic', 'minimal', 'professional']),
  spacing: z.number().min(0).max(3),
  showAvatar: z.boolean(),
  template: z.string().min(1, '模板ID不能为空'),
})

export const ResumeMetadataSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, '简历标题不能为空'),
  lastModified: z.number(),
  createdAt: z.number(),
  version: z.number().int().positive(),
})

export const ResumeDataSchema = z.object({
  metadata: ResumeMetadataSchema,
  personalInfo: PersonalInfoSchema,
  sections: z.array(z.object({
    type: z.enum(['personalInfo', 'education', 'experience', 'skills', 'projects', 'certifications', 'languages']),
    title: z.string().min(1, '区块标题不能为空'),
    data: z.array(z.any()),
    visible: z.boolean(),
    order: z.number().int().nonnegative(),
  })),
  settings: ResumeSettingsSchema,
})

// ============ 验证函数 ============

export function validatePersonalInfo(data: unknown): { success: boolean; errors?: string[] } {
  const result = PersonalInfoSchema.safeParse(data)
  if (result.success) return { success: true }
  return {
    success: false,
    errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
  }
}

export function validateEducation(data: unknown): { success: boolean; errors?: string[] } {
  const result = EducationSchema.safeParse(data)
  if (result.success) return { success: true }
  return {
    success: false,
    errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
  }
}

export function validateExperience(data: unknown): { success: boolean; errors?: string[] } {
  const result = ExperienceSchema.safeParse(data)
  if (result.success) return { success: true }
  return {
    success: false,
    errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
  }
}

export function validateResumeData(data: unknown): { success: boolean; errors?: string[] } {
  const result = ResumeDataSchema.safeParse(data)
  if (result.success) return { success: true }
  return {
    success: false,
    errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
  }
}
