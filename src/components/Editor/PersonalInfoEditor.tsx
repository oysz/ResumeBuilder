/**
 * 个人信息编辑器
 */

import React from 'react'
import { useAtom } from 'jotai'
import { personalInfoAtom } from '@/store/atoms'
import type { PersonalInfo, SocialLink } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export const PersonalInfoEditor: React.FC = () => {
  const [info, setInfo] = useAtom(personalInfoAtom)

  const updateInfo = (field: keyof PersonalInfo, value: any) => {
    setInfo((prev) => ({ ...prev, [field]: value }))
  }

  const addSocialLink = () => {
    const newLink: SocialLink = {
      id: uuidv4(),
      platform: '',
      url: '',
    }
    setInfo((prev) => ({ ...prev, socialLinks: [...prev.socialLinks, newLink] }))
  }

  const updateSocialLink = (id: string, field: keyof SocialLink, value: string) => {
    setInfo((prev) => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).map((link) =>
        link.id === id ? { ...link, [field]: value } : link
      ),
    }))
  }

  const removeSocialLink = (id: string) => {
    setInfo((prev) => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).filter((link) => link.id !== id),
    }))
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">个人信息</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
          <input
            type="text"
            value={info.name}
            onChange={(e) => updateInfo('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入姓名"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">邮箱 *</label>
          <input
            type="email"
            value={info.email}
            onChange={(e) => updateInfo('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">电话 *</label>
          <input
            type="tel"
            value={info.phone}
            onChange={(e) => updateInfo('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入电话号码"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">所在地 *</label>
          <input
            type="text"
            value={info.location}
            onChange={(e) => updateInfo('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="城市, 省份"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">个人网站</label>
        <input
          type="url"
          value={info.website}
          onChange={(e) => updateInfo('website', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://yourwebsite.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
        <textarea
          value={info.summary}
          onChange={(e) => updateInfo('summary', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="简要介绍自己..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">头像 URL</label>
        <input
          type="url"
          value={info.avatar}
          onChange={(e) => updateInfo('avatar', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/avatar.jpg"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">社交链接</label>
          <button
            type="button"
            onClick={addSocialLink}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            + 添加链接
          </button>
        </div>
        {(info.socialLinks || []).map((link) => (
          <div key={link.id} className="flex gap-2 mb-2">
            <input
              type="text"
              value={link.platform}
              onChange={(e) => updateSocialLink(link.id, 'platform', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="平台名称 (如: LinkedIn)"
            />
            <input
              type="url"
              value={link.url}
              onChange={(e) => updateSocialLink(link.id, 'url', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="URL"
            />
            <button
              type="button"
              onClick={() => removeSocialLink(link.id)}
              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
            >
              删除
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
