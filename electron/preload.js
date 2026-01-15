/**
 * Electron 预加载脚本
 * 在渲染进程中安全地暴露 Node.js 和 Electron API
 */

const { contextBridge, ipcRenderer } = require('electron')

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 平台信息
  platform: process.platform,

  // 新建简历
  onNewResume: (callback) => {
    ipcRenderer.on('new-resume', callback)
    return () => ipcRenderer.removeListener('new-resume', callback)
  },

  // 加载简历数据
  onLoadResume: (callback) => {
    ipcRenderer.on('load-resume', (event, data) => callback(data))
    return () => ipcRenderer.removeListener('load-resume', callback)
  },

  // 请求保存简历数据
  requestResumeData: () => {
    ipcRenderer.send('request-resume-data')
  },

  // 保存简历数据
  onSaveResumeData: (callback) => {
    ipcRenderer.on('save-resume-data', callback)
    return () => ipcRenderer.removeListener('save-resume-data', callback)
  },

  // 导出 PDF
  onExportPDF: (callback) => {
    ipcRenderer.on('export-pdf', callback)
    return () => ipcRenderer.removeListener('export-pdf', callback)
  },

  // ============ 自动更新相关 ============

  // 检查更新
  checkForUpdates: () => {
    ipcRenderer.send('check-for-updates')
  },

  // 下载更新
  downloadUpdate: () => {
    ipcRenderer.send('download-update')
  },

  // 安装更新
  installUpdate: () => {
    ipcRenderer.send('install-update')
  },

  // 监听更新状态
  onUpdateStatus: (callback) => {
    const handler = (event, data) => callback(data)
    ipcRenderer.on('update-status', handler)
    return () => ipcRenderer.removeListener('update-status', handler)
  },
})
