# 简历生成器 (Resume Builder)

一个功能丰富的简历生成器，支持 AI 智能助手、拖拽编辑、多种模板和 PDF 导出。

## 功能特性

### 🤖 AI 智能助手（v1.1.0 新增）
- **实时对话**: 基于智谱 AI GLM-4 的智能助手，实时流式输出
- **简历优化**: AI 帮助优化简历内容、润色描述、生成自我介绍
- **Markdown 渲染**: 支持格式化文本和代码块高亮
- **加密存储**: API Key 采用 AES 加密存储，安全可靠
- **历史记录**: 对话历史自动保存到本地

### 核心功能
- **可视化编辑器**: 直观的侧边栏编辑界面，支持实时预览
- **拖拽排序**: 使用 React DnD 实现区块和项目拖拽排序
- **多种模板**: 内置 4 种专业简历模板（现代、经典、极简、专业）
- **PDF 导出**: 支持导出为高质量 PDF 文件
- **图片导出**: 支持导出为 PNG/JPG 图片
- **自动保存**: 数据自动保存到本地存储

### 数据管理
- **状态管理**: 使用 Jotai 进行轻量级状态管理
- **版本控制**: 支持保存和恢复历史版本
- **数据导入导出**: 支持 JSON 格式的数据导入导出
- **表单验证**: 使用 Zod 进行数据验证

### 样式定制
- **多种字体**: 支持 Inter、Roboto、Open Sans、Lato、Merriweather
- **字号调整**: 小、中、大三档字号
- **配色方案**: 现代、经典、极简、专业四种配色
- **间距控制**: 支持自定义内容间距

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **状态管理**: Jotai
- **拖拽**: React DnD
- **导出**: jsPDF + html2canvas
- **验证**: Zod
- **样式**: Tailwind CSS
- **AI 集成**: 智谱 AI GLM-4 API（流式 SSE）
- **加密**: CryptoJS

## 安装和运行

### 安装依赖
\`\`\`bash
npm install
\`\`\`

### 开发模式
\`\`\`bash
npm run dev
\`\`\`

### 构建生产版本
\`\`\`bash
npm run build
\`\`\`

### 预览生产版本
\`\`\`bash
npm run preview
\`\`\`

## 项目结构

\`\`\`
src/
├── components/          # 组件
│   ├── AI/             # AI 助手组件（v1.1.0 新增）
│   │   ├── AIAssistant.tsx
│   │   ├── AIChat.tsx
│   │   ├── AIMessage.tsx
│   │   ├── APIKeyInput.tsx
│   │   └── AIFloatingButton.tsx
│   ├── DnD/            # 拖拽组件
│   ├── Editor/         # 编辑器组件
│   ├── Preview/        # 预览组件
│   └── Toolbar/        # 工具栏组件
├── services/           # 服务
│   ├── ai.service.ts   # AI API 服务（v1.1.0 新增）
│   ├── autoSave.service.ts
│   └── export.service.ts
├── store/              # 状态管理
│   └── atoms.ts        # 包含 AI 相关状态
├── templates/          # 简历模板
│   ├── templates/
│   ├── TemplateLoader.tsx
│   └── TemplateRenderer.tsx
├── types/              # 类型定义
│   ├── ai.types.ts     # AI 类型定义（v1.1.0 新增）
│   └── resume.types.ts
├── utils/              # 工具函数
│   ├── date.ts
│   ├── validation.ts
│   └── index.ts
├── App.tsx             # 主应用
├── main.tsx            # 入口文件
└── index.css           # 全局样式
\`\`\`

## 使用说明

1. **编辑个人信息**: 在"内容编辑"标签页填写基本信息
2. **添加经历**: 点击"添加"按钮添加教育、工作经历等
3. **调整区块顺序**: 拖拽区块调整显示顺序
4. **选择模板**: 在"模板选择"标签页选择喜欢的模板
5. **调整样式**: 在"样式设置"标签页调整字体、字号等
6. **使用 AI 助手**:
   - 点击右下角的 AI 按钮
   - 在设置中配置智谱 AI API Key
   - 在对话中让 AI 帮助优化简历内容
7. **导出简历**: 点击工具栏的"导出 PDF"按钮

## 数据持久化

- 数据自动保存到浏览器 localStorage
- 支持 JSON 格式导入导出
- 支持版本历史管理

## 浏览器兼容性

- Chrome/Edge (推荐)
- Firefox
- Safari

## 许可证

MIT
