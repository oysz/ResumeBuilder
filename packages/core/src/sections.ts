import type { ResumeSection } from './resume.types'

export const getSectionData = (
  sections: ResumeSection[],
  sectionType: ResumeSection['type']
) => sections.find((section) => section.type === sectionType)

export const updateSectionData = (
  sections: ResumeSection[],
  sectionType: ResumeSection['type'],
  newValue: ResumeSection | ((prev: ResumeSection | undefined) => ResumeSection)
): ResumeSection[] => {
  const nextSections = [...sections]
  const index = nextSections.findIndex((section) => section.type === sectionType)
  const prev = index >= 0 ? nextSections[index] : undefined
  const updated = typeof newValue === 'function' ? newValue(prev) : newValue

  if (index >= 0) {
    nextSections[index] = updated
  } else {
    nextSections.push(updated)
  }

  return reindexSections(nextSections)
}

export const reindexSections = (sections: ResumeSection[]): ResumeSection[] =>
  sections.map((section, index) => ({
    ...section,
    order: index,
  }))

export const moveSection = (
  sections: ResumeSection[],
  fromIndex: number,
  toIndex: number
): ResumeSection[] => {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= sections.length ||
    toIndex >= sections.length ||
    fromIndex === toIndex
  ) {
    return reindexSections(sections)
  }

  const nextSections = [...sections]
  const [moved] = nextSections.splice(fromIndex, 1)
  nextSections.splice(toIndex, 0, moved)
  return reindexSections(nextSections)
}
