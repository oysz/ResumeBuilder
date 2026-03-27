/**
 * 自动更新对话框组件
 * 显示更新进度和更新信息
 */

import React, { useEffect, useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { updateStateAtom, setUpdateStatusAtom, resetUpdateStateAtom } from '@/store/atoms'
import type { UpdateStatusData } from '@/types/update.types'

export const UpdateDialog: React.FC = () => {
  const updateState = useAtomValue(updateStateAtom)
  const setUpdateStatus = useSetAtom(setUpdateStatusAtom)
  const resetUpdateState = useSetAtom(resetUpdateStateAtom)
  const [localStatus, setLocalStatus] = useState<UpdateStatusData | null>(null)

  // 监听更新状态变化
  useEffect(() => {
    if (!window.electronAPI?.onUpdateStatus) return

    const cleanup = window.electronAPI.onUpdateStatus((data: UpdateStatusData) => {
      setLocalStatus(data)

      // 根据状态更新 UI
      if (data.status === 'update-available') {
        setUpdateStatus({
          visible: true,
          status: data.status,
          message: data.message,
          updateInfo: data.info,
        })
      } else if (data.status === 'update-not-available') {
        setUpdateStatus({
          visible: true,
          status: data.status,
          message: data.message,
          currentVersion: data.currentVersion,
        })
      } else if (data.status === 'downloading') {
        setUpdateStatus({
          visible: true,
          status: data.status,
          message: data.message,
          downloadProgress: data.progress,
        })
      } else if (data.status === 'update-downloaded') {
        setUpdateStatus({
          visible: true,
          status: data.status,
          message: data.message,
          updateInfo: data.info,
        })
      } else if (data.status === 'error') {
        setUpdateStatus({
          visible: true,
          status: data.status,
          message: data.message,
          error: data.error,
        })
      }
    })

    return cleanup
  }, [setUpdateStatus])

  const handleDownloadUpdate = () => {
    if (window.electronAPI?.downloadUpdate) {
      window.electronAPI.downloadUpdate()
    }
  }

  const handleInstallUpdate = () => {
    if (window.electronAPI?.installUpdate) {
      window.electronAPI.installUpdate()
    }
  }

  const handleClose = () => {
    resetUpdateState()
    setLocalStatus(null)
  }

  if (!updateState.visible && !localStatus) {
    return null
  }

  const status = localStatus?.status || updateState.status
  const message = localStatus?.message || updateState.message
  const updateInfo = localStatus?.info || updateState.updateInfo
  const progress = localStatus?.progress || updateState.downloadProgress

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* 头部 */}
        <div className="bg-blue-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">应用更新</h2>
            {status !== 'downloading' && status !== 'update-downloaded' && (
              <button
                onClick={handleClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* 内容 */}
        <div className="px-6 py-6">
          {/* 图标 */}
          <div className="flex justify-center mb-4">
            {status === 'checking' && (
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600" />
            )}
            {status === 'update-available' && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            {status === 'update-not-available' && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            {status === 'downloading' && (
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">
                    {progress?.percent || 0}%
                  </span>
                </div>
              </div>
            )}
            {status === 'update-downloaded' && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {status === 'error' && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>

          {/* 消息 */}
          <p className="text-center text-gray-700 mb-4">{message}</p>

          {/* 更新信息 */}
          {updateInfo && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">新版本:</span>
                <span className="text-sm font-bold text-blue-600">{updateInfo.version}</span>
              </div>
              {updateState.currentVersion && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">当前版本:</span>
                  <span className="text-sm text-gray-600">{updateState.currentVersion}</span>
                </div>
              )}
              {updateInfo.releaseDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">发布日期:</span>
                  <span className="text-sm text-gray-600">
                    {new Date(updateInfo.releaseDate).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              )}
              {updateInfo.releaseNotes && (
                <div className="mt-3">
                  <span className="text-sm font-medium text-gray-700">更新说明:</span>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                    {updateInfo.releaseNotes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 下载进度 */}
          {progress && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">下载进度</span>
                <span className="text-sm font-semibold text-blue-600">{progress.percent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                <span>
                  已下载: {progress.transferred} MB / {progress.total} MB
                </span>
              </div>
            </div>
          )}

          {/* 错误信息 */}
          {updateState.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-600">{updateState.error}</p>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3">
          {status === 'update-available' && (
            <>
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                稍后提醒
              </button>
              <button
                onClick={handleDownloadUpdate}
                className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                立即更新
              </button>
            </>
          )}
          {status === 'update-not-available' && (
            <button
              onClick={handleClose}
              className="w-full px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              确定
            </button>
          )}
          {status === 'downloading' && (
            <button
              disabled
              className="w-full px-4 py-2 text-sm text-gray-500 bg-gray-200 rounded-md cursor-not-allowed"
            >
              下载中...
            </button>
          )}
          {status === 'update-downloaded' && (
            <button
              onClick={handleInstallUpdate}
              className="w-full px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              重启并安装
            </button>
          )}
          {status === 'error' && (
            <>
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                关闭
              </button>
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                稍后重试
              </button>
            </>
          )}
          {status === 'checking' && (
            <button
              disabled
              className="w-full px-4 py-2 text-sm text-gray-500 bg-gray-200 rounded-md cursor-not-allowed"
            >
              检查中...
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
