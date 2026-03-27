import { describe, expect, it } from 'vitest'
import {
  createDefaultResumeData,
  moveSection,
  parseResumeData,
  serializeResumeData,
  validateResumeData,
} from './index'

describe('core resume helpers', () => {
  it('creates a default resume payload with ordered sections', () => {
    const data = createDefaultResumeData()

    expect(data.metadata.title).toBe('我的简历')
    expect(data.sections).toHaveLength(6)
    expect(data.sections.map((section) => section.order)).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('reorders sections and reindexes their order', () => {
    const data = createDefaultResumeData()
    const nextSections = moveSection(data.sections, 0, 2)

    expect(nextSections[2]?.type).toBe('education')
    expect(nextSections.map((section) => section.order)).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('serializes and parses resume json without data loss', () => {
    const data = createDefaultResumeData('移动端简历')
    data.personalInfo.name = 'Alice'
    data.personalInfo.email = 'alice@example.com'
    data.personalInfo.phone = '13800138000'
    data.personalInfo.location = 'Shanghai'

    const serialized = serializeResumeData(data)
    const parsed = parseResumeData(serialized)

    expect(parsed.metadata.title).toBe('移动端简历')
    expect(parsed.personalInfo.name).toBe('Alice')
  })

  it('validates malformed resume payloads', () => {
    const result = validateResumeData({
      metadata: {},
      personalInfo: {},
      sections: [],
      settings: {},
    })

    expect(result.success).toBe(false)
    expect(result.errors?.length).toBeGreaterThan(0)
  })
})
