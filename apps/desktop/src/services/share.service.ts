/**
 * 分享服务
 * 处理简历分享功能（复制到剪贴板、打开微信等）
 */

import html2canvas from 'html2canvas'
import type { ShareOptions, ShareResult } from '@/types/share.types'

export class ShareService {
  /**
   * 将简历图片复制到剪贴板
   */
  static async copyToClipboard(
    element: HTMLElement,
    options: Partial<ShareOptions> = {}
  ): Promise<ShareResult> {
    try {
      const defaultOptions: ShareOptions = {
        type: 'clipboard',
        format: 'png',
        quality: 1,
      }

      const opts = { ...defaultOptions, ...options }

      // 使用 html2canvas 将 DOM 转换为 canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      // 转换为 blob
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob(
          (b) => resolve(b!),
          opts.format === 'png' ? 'image/png' : 'image/jpeg',
          opts.quality
        )
      )

      // 检查是否在 Electron 环境
      if (window.electronAPI?.copyImageToClipboard) {
        // Electron 环境：使用原生 clipboard API
        const buffer = await blob.arrayBuffer()
        const success = await window.electronAPI.copyImageToClipboard(buffer)

        if (!success) {
          throw new Error('剪贴板复制失败')
        }
      } else {
        // Web 环境：使用 Clipboard API
        if (!navigator.clipboard) {
          throw new Error('当前浏览器不支持剪贴板功能')
        }

        const clipboardItem = new ClipboardItem({
          [blob.type]: blob,
        })
        await navigator.clipboard.write([clipboardItem])
      }

      return {
        success: true,
        type: 'clipboard',
      }
    } catch (error) {
      console.error('[Share] 剪贴板复制失败:', error)
      return {
        success: false,
        type: 'clipboard',
        error: error instanceof Error ? error.message : '复制到剪贴板失败',
      }
    }
  }

  /**
   * 打开微信客户端
   */
  static async openWeChat(): Promise<ShareResult> {
    try {
      // 微信 URL scheme
      const wechatUrl = 'weixin://'

      if (window.electronAPI?.openExternal) {
        // Electron 环境：使用 shell.openExternal
        const success = await window.electronAPI.openExternal(wechatUrl)

        if (!success) {
          throw new Error('无法打开微信客户端')
        }
      } else {
        // Web 环境：尝试打开链接
        window.location.href = wechatUrl
      }

      return {
        success: true,
        type: 'wechat',
      }
    } catch (error) {
      console.error('[Share] 打开微信失败:', error)
      return {
        success: false,
        type: 'wechat',
        error: error instanceof Error ? error.message : '打开微信失败',
      }
    }
  }

  /**
   * 分享简历（主入口）
   */
  static async share(
    element: HTMLElement,
    type: 'clipboard' | 'wechat',
    options?: Partial<ShareOptions>
  ): Promise<ShareResult> {
    if (type === 'clipboard') {
      return this.copyToClipboard(element, options)
    } else if (type === 'wechat') {
      return this.openWeChat()
    }

    return {
      success: false,
      type,
      error: '不支持的分享类型',
    }
  }
}
