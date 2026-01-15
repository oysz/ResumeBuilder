# Electron 跨端应用设置指南

本项目已经配置了 Electron 支持，可以打包成跨平台桌面应用（Windows、macOS、Linux）。

## 📦 安装依赖

由于网络问题，Electron 可能需要手动安装。请尝试以下方法：

### 方法 1：使用国内镜像
```bash
npm config set registry https://registry.npmmirror.com
npm config set electron_mirror https://npmmirror.com/mirrors/electron/
npm install --save-dev electron electron-builder concurrently cross-env wait-on
```

### 方法 2：手动下载
如果上述方法失败，可以从以下地址手动下载 Electron：
- https://npmmirror.com/mirrors/electron/
- 下载对应版本后放到 `C:\Users\你的用户名\AppData\Local\electron\Cache\` 目录

## 🚀 开发和构建命令

### Web 开发（原有功能）
```bash
npm run dev          # 启动 Web 开发服务器
npm run build        # 构建 Web 版本
npm run preview      # 预览 Web 构建
```

### Electron 开发
```bash
npm run electron:dev        # 启动 Electron 开发模式
```

### Electron 打包
```bash
npm run electron:build         # 打包所有平台
npm run electron:build:win     # 仅打包 Windows
npm run electron:build:mac     # 仅打包 macOS
npm run electron:build:linux   # 仅打包 Linux
```

## 📁 项目结构

```
ResumeBuilder/
├── electron/
│   ├── main.js          # Electron 主进程
│   └── preload.js       # 预加载脚本（安全桥接）
├── src/
│   ├── hooks/
│   │   └── useElectron.ts   # Electron 集成 Hook
│   ├── types/
│   │   └── electron.d.ts     # Electron 类型声明
│   └── ...
├── dist/                  # Web 构建输出
└── release/               # Electron 打包输出
```

## ✨ Electron 特有功能

### 1. 系统菜单
- 文件操作：新建、打开、保存 JSON
- 编辑操作：撤销、重做、剪切、复制、粘贴
- 视图操作：缩放、全屏、开发者工具

### 2. 快捷键
- `Ctrl+N` / `Cmd+N`: 新建简历
- `Ctrl+O` / `Cmd+O`: 打开 JSON
- `Ctrl+S` / `Cmd+S`: 保存 JSON
- `Ctrl+P` / `Cmd+P`: 导出 PDF

### 3. 文件对话框
- 使用原生文件选择器
- 自动添加文件扩展名
- 支持默认文件名

## 🎨 自定义应用图标

将应用图标放在 `build/` 目录：
- Windows: `icon.ico`
- macOS: `icon.icns`
- Linux: `icon.png`

可以使用在线工具转换图标：
- https://icoconvert.com/
- https://cloudconvert.com/

## 📤 打包后的应用

打包完成后，安装包位于 `release/` 目录：

- **Windows**: `.exe` 安装程序和 `.zip` 压缩包
- **macOS**: `.dmg` 镜像文件和 `.zip` 压缩包
- **Linux**: `.AppImage`、`.deb`、`.rpm` 包

## ⚙️ 配置说明

### package.json 关键配置
- `main: "electron/main.js"` - Electron 主进程入口
- `homepage: "./"` - 确保资源路径正确
- `build` - electron-builder 打包配置

### Vite 配置
已自动适配 Electron，无需额外配置。

## 🔧 常见问题

### Q: Electron 开发模式启动失败
A: 确保 Vite 开发服务器（端口 3002）先启动，或者使用 `npm run electron:dev` 会自动启动。

### Q: 打包后应用无法打开
A: 检查 `dist/` 目录是否存在且包含正确的文件，确保先运行 `npm run build`。

### Q: macOS 打包失败
A: 需要在 macOS 系统上进行打包，或者配置虚拟机。

### Q: Windows Defender 报警
A: 这是正常现象，选择"仍要运行"即可。发布时建议进行代码签名。

## 📝 注意事项

1. **同时支持 Web 和 Electron**：所有代码都是通用的，无需修改即可在两种环境中运行
2. **自动检测环境**：使用 `window.electronAPI` 检测是否在 Electron 环境中
3. **安全最佳实践**：使用 `contextBridge` 和 `contextIsolation` 确保安全

## 🎯 下一步

1. 添加应用图标
2. 配置代码签名（macOS 和 Windows）
3. 添加自动更新功能
4. 发布到应用商店
