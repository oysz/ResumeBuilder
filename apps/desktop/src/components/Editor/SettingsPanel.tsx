/**
 * 设置面板
 * 调整字体、字号、间距等设置
 */

import React from 'react'
import { useAtom } from 'jotai'
import { settingsAtom } from '@/store/atoms'
import type { FontFamily, FontSize, ColorScheme } from '@/types'

export const SettingsPanel: React.FC = () => {
  const [settings, setSettings] = useAtom(settingsAtom)

  const updateSetting = <K extends keyof typeof settings>(
    key: K,
    value: typeof settings[K]
  ) => {
    setSettings({ ...settings, [key]: value })
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">样式设置</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">字体</label>
        <div className="grid grid-cols-2 gap-2">
          {(['inter', 'roboto', 'opensans', 'lato', 'merriweather'] as FontFamily[]).map(
            (font) => (
              <button
                key={font}
                type="button"
                onClick={() => updateSetting('fontFamily', font)}
                className={`
                  px-4 py-2 rounded-md capitalize transition-colors
                  ${
                    settings.fontFamily === font
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {font}
              </button>
            )
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">字号</label>
        <div className="flex gap-2">
          {(['small', 'medium', 'large'] as FontSize[]).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => updateSetting('fontSize', size)}
              className={`
                px-4 py-2 rounded-md capitalize transition-colors
                ${
                  settings.fontSize === size
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {size === 'small' ? '小' : size === 'medium' ? '中' : '大'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          配色方案
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['modern', 'classic', 'minimal', 'professional'] as ColorScheme[]).map(
            (scheme) => (
              <button
                key={scheme}
                type="button"
                onClick={() => updateSetting('colorScheme', scheme)}
                className={`
                  px-4 py-2 rounded-md capitalize transition-colors
                  ${
                    settings.colorScheme === scheme
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {scheme}
              </button>
            )
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          间距: {settings.spacing}
        </label>
        <input
          type="range"
          min="0"
          max="3"
          step="1"
          value={settings.spacing}
          onChange={(e) => updateSetting('spacing', parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>紧凑</span>
          <span>舒适</span>
          <span>宽松</span>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="showAvatar"
          checked={settings.showAvatar}
          onChange={(e) => updateSetting('showAvatar', e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="showAvatar" className="text-sm text-gray-700">
          显示头像
        </label>
      </div>
    </div>
  )
}
