/**
 * Electron 主进程
 * 负责创建和管理应用窗口
 */

const { app, BrowserWindow, Menu, dialog, ipcMain, shell, clipboard, nativeImage } = require('electron')
const { autoUpdater } = require('electron-updater')
const log = require('electron-log')
const path = require('path')
const fs = require('fs')

// 保持对窗口对象的全局引用，避免被垃圾回收
let mainWindow = null
const isDev = process.env.NODE_ENV === 'development'

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
    },
    icon: path.join(__dirname, '../build/icon.png'),
  })

  // 加载应用
  if (isDev) {
    // 开发环境：加载 Vite 开发服务器
    mainWindow.loadURL('http://localhost:3000')
    // 打开开发者工具
    mainWindow.webContents.openDevTools()
  } else {
    // 生产环境：加载打包后的文件
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 当窗口关闭时触发
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 拦截新窗口打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // 创建应用菜单
  createMenu()

  // 初始化自动更新（仅生产环境）
  if (!isDev) {
    configureAutoUpdater()
  }
}

// ============ 自动更新配置 ============

// 配置自动更新
function configureAutoUpdater() {
  // 配置 updater 参数 - 使用 GitHub Releases
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'oysz',
    repo: 'ResumeBuilder',
    // 使用 token 避免 406 错误
    // 注意：生产环境中应该从环境变量读取
  })

  autoUpdater.logger = log
  autoUpdater.logger.transports.file.level = 'info'

  // 设置自动下载为 false，让用户手动确认
  autoUpdater.autoDownload = false

  // 添加请求头，避免 406 错误
  autoUpdater.requestHeaders = {
    'Accept': 'application/json, text/plain, */*'
  }

  // 开发/测试环境：禁用签名验证
  // 注意：生产环境应该使用有效的 Apple Developer 证书进行签名
  // 这里使用环境变量控制
  if (process.env.DISABLE_CODE_SIGNING === 'true' || !app.isPackaged) {
    autoUpdater.autoRunAppAfterUpdate = false
    // 在安装前手动验证或跳过验证
    autoUpdater.on('update-downloaded', (info) => {
      // 自定义安装流程，跳过签名验证
      log.info('Update downloaded, custom install process')
    })
  }

  autoUpdater.on('checking-for-update', () => {
    mainWindow?.webContents.send('update-status', {
      status: 'checking',
      message: '正在检查更新...',
    })
  })

  autoUpdater.on('update-available', (info) => {
    // 检测到新版本
    const releaseUrl = 'https://github.com/oysz/ResumeBuilder/releases/latest'

    // 对于 macOS 开发/测试环境，推荐手动下载以避免签名问题
    if (process.platform === 'darwin') {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '发现新版本',
        message: `发现新版本 ${info.version}`,
        detail: `当前版本：${app.getVersion()}\n\n由于 macOS 的安全机制，建议您手动下载新版本：\n\n1. 点击"前往下载"打开下载页面\n2. 下载最新的 .dmg 文件\n3. 拖拽到 Applications 文件夹`,
        buttons: ['前往下载', '稍后提醒', '自动更新（可能失败）'],
        defaultId: 0,
        cancelId: 1
      }).then(result => {
        if (result.response === 0) {
          // 前往下载
          shell.openExternal(releaseUrl)
        } else if (result.response === 2) {
          // 尝试自动更新 - 发送事件到前端
          mainWindow?.webContents.send('update-available', {
            status: 'update-available',
            message: '发现新版本',
            info: {
              version: info.version,
              releaseDate: info.releaseDate,
              releaseNotes: info.releaseNotes
            }
          })
          autoUpdater.downloadUpdate()
        }
      })
    } else if (process.platform === 'win32') {
      // Windows：说明安全警告后让用户选择
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '发现新版本',
        message: `发现新版本 ${info.version}`,
        detail: `当前版本：${app.getVersion()}\n\n您可以：\n\n1. 自动更新（推荐）：程序会自动下载并安装更新\n   注意：可能会看到 Windows Defender 的安全警告，点击"更多信息" → "仍要运行" 即可\n\n2. 手动下载：前往 GitHub 下载最新版本`,
        buttons: ['自动更新', '手动下载', '稍后提醒'],
        defaultId: 0,
        cancelId: 2
      }).then(result => {
        if (result.response === 0) {
          // 自动更新 - 发送事件到前端
          mainWindow?.webContents.send('update-available', {
            status: 'update-available',
            message: '发现新版本',
            info: {
              version: info.version,
              releaseDate: info.releaseDate,
              releaseNotes: info.releaseNotes
            }
          })
        } else if (result.response === 1) {
          // 手动下载
          shell.openExternal(releaseUrl)
        }
      })
    } else {
      // Linux：直接使用自动更新
      mainWindow?.webContents.send('update-available', {
        status: 'update-available',
        message: '发现新版本',
        info: {
          version: info.version,
          releaseDate: info.releaseDate,
          releaseNotes: info.releaseNotes
        }
      })
    }
  })

  autoUpdater.on('update-not-available', (info) => {
    mainWindow?.webContents.send('update-status', {
      status: 'update-not-available',
      message: '当前已是最新版本',
      currentVersion: info.version,
    })
  })

  autoUpdater.on('download-progress', (progress) => {
    mainWindow?.webContents.send('update-status', {
      status: 'downloading',
      message: '正在下载更新...',
      progress: {
        percent: Math.floor(progress.percent),
        transferred: Math.floor(progress.transferred / 1024 / 1024),
        total: Math.floor(progress.total / 1024 / 1024),
      },
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    mainWindow?.webContents.send('update-status', {
      status: 'update-downloaded',
      message: '更新下载完成，即将重启应用',
      info: {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes,
      },
    })
  })

  autoUpdater.on('error', (error) => {
    // 如果是 404 错误（通常是因为没有 Release），不显示错误
    if (error.message.includes('404')) {
      console.log('暂无可用的更新版本')
      return
    }
    mainWindow?.webContents.send('update-status', {
      status: 'error',
      message: '更新失败',
      error: error.message,
    })
  })
}

// 检查更新
async function checkForUpdates() {
  try {
    await autoUpdater.checkForUpdates()
  } catch (error) {
    // 如果是 404 错误（通常是因为没有 Release），不显示错误
    if (error.message?.includes('404')) {
      console.log('暂无可用的更新版本')
      return
    }
    mainWindow?.webContents.send('update-status', {
      status: 'error',
      message: '检查更新失败',
      error: error.message,
    })
  }
}

// 创建应用菜单
function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建简历',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-resume')
          },
        },
        {
          label: '打开 JSON',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [{ name: 'JSON Files', extensions: ['json'] }],
            })
            if (!result.canceled && result.filePaths.length > 0) {
              const data = fs.readFileSync(result.filePaths[0], 'utf-8')
              mainWindow.webContents.send('load-resume', JSON.parse(data))
            }
          },
        },
        {
          label: '保存 JSON',
          accelerator: 'CmdOrCtrl+S',
          click: async () => {
            mainWindow.webContents.send('request-resume-data')
          },
        },
        {
          label: '导出 PDF',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            mainWindow.webContents.send('export-pdf')
          },
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit()
          },
        },
      ],
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
      ],
    },
    {
      label: '视图',
      submenu: [
        { label: '重新加载', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: '强制重新加载', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: '切换开发者工具', accelerator: 'CmdOrCtrl+Shift+I', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: '实际大小', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: '放大', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: '缩小', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: '切换全屏', accelerator: 'F11', role: 'togglefullscreen' },
      ],
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '检查更新',
          click: () => {
            checkForUpdates()
          },
        },
        { type: 'separator' },
        {
          label: '关于',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于简历生成器',
              message: '简历生成器',
              detail: `版本: ${app.getVersion()}\n一款简洁好用的简历制作工具\n支持导出 PDF、图片等多种格式`,
            })
          },
        },
      ],
    },
  ]

  // macOS 特殊处理
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { label: '关于简历生成器', role: 'about' },
        { type: 'separator' },
        { label: '服务', role: 'services', submenu: [] },
        { type: 'separator' },
        { label: '隐藏简历生成器', role: 'hide' },
        { label: '隐藏其他', role: 'hideothers' },
        { label: '显示全部', role: 'unhide' },
        { type: 'separator' },
        { label: '退出简历生成器', role: 'quit' },
      ],
    })
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// IPC 通信处理
ipcMain.on('save-resume-data', async (event, data) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: `${data.metadata.title || 'resume'}.json`,
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
  })

  if (!result.canceled) {
    fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2))
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: '保存成功',
      message: '简历数据已保存',
    })
  }
})

// 更新相关 IPC 通信
ipcMain.on('check-for-updates', () => {
  checkForUpdates()
})

ipcMain.on('download-update', () => {
  autoUpdater.downloadUpdate()
})

ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall()
})

// ============ 分享相关 IPC 通信 ============

// 复制图片到剪贴板
ipcMain.handle('copy-image-to-clipboard', async (event, imageBuffer) => {
  try {
    const buffer = Buffer.from(imageBuffer)
    const image = nativeImage.createFromBuffer(buffer)
    clipboard.writeImage(image)
    return { success: true }
  } catch (error) {
    console.error('复制到剪贴板失败:', error)
    return { success: false, error: error.message }
  }
})

// 打开外部链接或应用
ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url)
    return { success: true }
  } catch (error) {
    console.error('打开外部应用失败:', error)
    return { success: false, error: error.message }
  }
})

// 当所有窗口关闭时退出应用（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 当应用被激活时创建窗口（macOS）
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// 应用就绪后创建窗口
app.on('ready', () => {
  createWindow()

  // 启动时自动检查更新（仅生产环境，延迟3秒）
  if (!isDev) {
    setTimeout(() => {
      checkForUpdates()
    }, 3000)
  }
})

// 处理任何未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error)
})
