/**
 * 导出服务
 * 处理简历的 PDF、图片导出
 */

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { ResumeData, ExportOptions, ExportResult } from '@/types'

export class ExportService {
  /**
   * 导出为 PDF
   */
  static async exportToPDF(
    element: HTMLElement,
    options: Partial<ExportOptions> = {}
  ): Promise<ExportResult> {
    try {
      const defaultOptions: ExportOptions = {
        format: 'pdf',
        quality: 1,
        pageSize: 'A4',
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        filename: 'resume.pdf',
      }

      const opts = { ...defaultOptions, ...options }

      // 使用 html2canvas 将 DOM 转换为 canvas
      const canvas = await html2canvas(element, {
        scale: 2, // 提高清晰度
        useCORS: true,
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')

      // 创建 PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: opts.pageSize,
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth - opts.margins.left - opts.margins.right
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = opts.margins.top

      pdf.addImage(imgData, 'PNG', opts.margins.left, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', opts.margins.left, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(opts.filename)

      return {
        success: true,
      }
    } catch (error) {
      console.error('[Export] PDF 导出失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PDF 导出失败',
      }
    }
  }

  /**
   * 导出为图片
   */
  static async exportToImage(
    element: HTMLElement,
    options: Partial<ExportOptions> = {}
  ): Promise<ExportResult> {
    try {
      const defaultOptions: ExportOptions = {
        format: 'png',
        quality: 1,
        pageSize: 'A4',
        margins: { top: 0, right: 0, bottom: 0, left: 0 },
        filename: 'resume.png',
      }

      const opts = { ...defaultOptions, ...options }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = opts.filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
          }
        },
        opts.format === 'png' ? 'image/png' : 'image/jpeg',
        opts.quality
      )

      return {
        success: true,
        blob: await new Promise((resolve) =>
          canvas.toBlob(
            (blob) => resolve(blob!),
            opts.format === 'png' ? 'image/png' : 'image/jpeg',
            opts.quality
          )
        ),
      }
    } catch (error) {
      console.error('[Export] 图片导出失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '图片导出失败',
      }
    }
  }

  /**
   * 打印
   */
  static print(element: HTMLElement): void {
    const printWindow = window.open('', '', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>打印简历</title>
            <style>
              body { margin: 0; padding: 0; }
              @media print {
                body { margin: 0; }
                @page { margin: 0; }
              }
            </style>
          </head>
          <body>
            ${element.innerHTML}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }
  }

  /**
   * 导出简历数据为 JSON
   */
  static exportToJSON(data: ResumeData, filename?: string): void {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `resume-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
