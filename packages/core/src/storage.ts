import type { ResumeData } from './resume.types'
import { validateResumeData } from './resume.types'

export const serializeResumeData = (data: ResumeData): string => JSON.stringify(data, null, 2)

export const parseResumeData = (raw: string): ResumeData => {
  const parsed = JSON.parse(raw) as unknown
  const result = validateResumeData(parsed)

  if (!result.success) {
    throw new Error(result.errors?.join('\n') || '简历数据格式错误')
  }

  return parsed as ResumeData
}

export const safeParseResumeData = (
  raw: string
): { success: true; data: ResumeData } | { success: false; errors: string[] } => {
  try {
    const data = parseResumeData(raw)
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : '简历数据格式错误'],
    }
  }
}
