/**
 * 验证工具函数
 */

export const ValidationUtils = {
  /**
   * 验证邮箱格式
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  /**
   * 验证URL格式
   */
  isValidUrl(url: string): boolean {
    if (!url) return true // 允许空值
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  /**
   * 验证电话号码格式
   */
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\-+()]+$/
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7
  },

  /**
   * 验证日期格式
   */
  isValidDate(dateString: string): boolean {
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime())
  },

  /**
   * 检查必填字段
   */
  checkRequiredFields(obj: Record<string, any>, requiredFields: string[]): string[] {
    const missingFields: string[] = []
    for (const field of requiredFields) {
      const value = obj[field]
      if (value === undefined || value === null || value === '') {
        missingFields.push(field)
      }
    }
    return missingFields
  },

  /**
   * 验证完整性
   */
  validateCompleteness(data: any): {
    isComplete: boolean
    missingFields: string[]
    score: number
  } {
    const requiredFields = [
      'personalInfo.name',
      'personalInfo.email',
      'personalInfo.phone',
    ]

    const missingFields: string[] = []
    let completedFields = 0
    const totalFields = requiredFields.length

    for (const field of requiredFields) {
      const keys = field.split('.')
      let value = data
      for (const key of keys) {
        value = value?.[key]
      }
      if (value) {
        completedFields++
      } else {
        missingFields.push(field)
      }
    }

    return {
      isComplete: missingFields.length === 0,
      missingFields,
      score: Math.round((completedFields / totalFields) * 100),
    }
  },
}
