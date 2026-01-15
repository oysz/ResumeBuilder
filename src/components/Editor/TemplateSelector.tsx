/**
 * 模板选择器
 */

import React from 'react'
import { useAtom } from 'jotai'
import { settingsAtom } from '@/store/atoms'
import { AVAILABLE_TEMPLATES } from '@/templates'
import type { Template } from '@/types'

export const TemplateSelector: React.FC = () => {
  const [settings, setSettings] = useAtom(settingsAtom)

  const selectTemplate = (template: Template) => {
    setSettings({
      ...settings,
      template: template.id,
      ...template.settings,
    })
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">选择模板</h3>
      <div className="grid grid-cols-2 gap-4">
        {AVAILABLE_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => selectTemplate(template)}
            className={`
              p-4 rounded-lg border-2 text-left transition-all
              ${
                settings.template === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <div className="font-medium text-gray-900 mb-1">{template.name}</div>
            <div className="text-sm text-gray-600">{template.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
