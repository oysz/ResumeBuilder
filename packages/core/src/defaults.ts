import { v4 as uuidv4 } from 'uuid'
import type {
  Certification,
  Education,
  Experience,
  Language,
  PersonalInfo,
  Project,
  ResumeData,
  ResumeMetadata,
  ResumeSection,
  ResumeSettings,
  SectionType,
  Skill,
  VersionSnapshot,
} from './resume.types'

export const DEFAULT_PERSONAL_INFO: PersonalInfo = {
  name: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  socialLinks: [],
  summary: '',
  avatar: '',
}

export const DEFAULT_SETTINGS: ResumeSettings = {
  fontSize: 'medium',
  fontFamily: 'inter',
  colorScheme: 'modern',
  spacing: 1,
  showAvatar: true,
  template: 'modern',
}

const DEFAULT_SECTION_TITLES: Record<Exclude<SectionType, 'personalInfo'>, string> = {
  education: '教育经历',
  experience: '工作经历',
  skills: '专业技能',
  projects: '项目经历',
  certifications: '证书荣誉',
  languages: '语言能力',
}

export const STORAGE_KEYS = {
  resumeData: 'resume-data',
  versionHistory: 'resume-versions',
} as const

export const MAX_VERSION_HISTORY = 20

export const createResumeMetadata = (title: string = '我的简历'): ResumeMetadata => ({
  id: uuidv4(),
  title,
  lastModified: Date.now(),
  createdAt: Date.now(),
  version: 1,
})

export const createDefaultSections = (): ResumeSection[] => {
  const orderedTypes: Array<Exclude<SectionType, 'personalInfo'>> = [
    'education',
    'experience',
    'skills',
    'projects',
    'certifications',
    'languages',
  ]

  return orderedTypes.map((type, index) => ({
    type,
    title: DEFAULT_SECTION_TITLES[type],
    data: [],
    visible: true,
    order: index,
  }))
}

export const createDefaultResumeData = (title?: string): ResumeData => ({
  metadata: createResumeMetadata(title),
  personalInfo: { ...DEFAULT_PERSONAL_INFO },
  sections: createDefaultSections(),
  settings: { ...DEFAULT_SETTINGS },
})

export const cloneResumeData = (data: ResumeData): ResumeData =>
  JSON.parse(JSON.stringify(data)) as ResumeData

export const createVersionSnapshot = (
  data: ResumeData,
  versionCount: number,
  description?: string
): VersionSnapshot => ({
  id: uuidv4(),
  timestamp: Date.now(),
  data: cloneResumeData(data),
  description: description || `版本 ${versionCount + 1}`,
})

export const createEmptySectionItem = (
  sectionType: Exclude<SectionType, 'personalInfo'>
): Education | Experience | Skill | Project | Certification | Language => {
  switch (sectionType) {
    case 'education':
      return {
        id: uuidv4(),
        school: '',
        degree: '',
        major: '',
        startDate: '',
        endDate: '',
        current: false,
        gpa: '',
        description: '',
      }
    case 'experience':
      return {
        id: uuidv4(),
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        location: '',
        description: '',
        achievements: [],
      }
    case 'skills':
      return {
        id: uuidv4(),
        name: '',
        level: 3,
        category: '',
      }
    case 'projects':
      return {
        id: uuidv4(),
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        technologies: [],
        url: '',
        achievements: [],
      }
    case 'certifications':
      return {
        id: uuidv4(),
        name: '',
        issuer: '',
        date: '',
        url: '',
        credentialId: '',
      }
    case 'languages':
      return {
        id: uuidv4(),
        name: '',
        proficiency: 'intermediate',
      }
  }
}
