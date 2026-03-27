# Resume Builder

一个基于 `npm workspaces` 的多端简历项目：

- `apps/desktop`: 现有 `React + Electron + Vite` 桌面端
- `apps/mobile`: 新增 `Expo + React Native` 移动端 MVP
- `packages/core`: 桌面端和移动端共享的数据模型、默认值、校验、序列化和纯逻辑

## 当前状态

### Desktop
- 保留原有 AI、拖拽、模板、导出、Electron IPC 与自动更新能力
- 已迁移到 `apps/desktop`

### Mobile MVP
- 支持个人信息和各类 section 的基础编辑
- 支持单模板预览
- 支持 `AsyncStorage` 本地持久化
- 支持 JSON 导入导出
- section 排序采用“上移 / 下移”按钮

### Shared Core
- `ResumeData` / `ResumeSection` / `ResumeSettings`
- Zod schema 与数据校验
- 默认数据工厂
- section 排序与更新逻辑
- JSON 序列化 / 反序列化
- 平台抽象接口：`StorageAdapter`、`FileAdapter`

## 安装

```bash
npm install
```

## 常用命令

### 桌面端开发

```bash
npm run desktop:electron:dev
```

### 桌面端构建

```bash
npm run desktop:build
```

### 移动端启动

```bash
npm run mobile:start
```

### 移动端类型检查

```bash
npm run mobile:typecheck
```

### 移动端发布

```bash
npm run mobile:release
```

> 需要先配置 `apps/mobile/eas.json` 和仓库 secret `EXPO_TOKEN`，CI 才会在打 `v*` tag 时自动触发 Android / iOS 构建。

### 共享层类型检查

```bash
npm run core:typecheck
```

### 共享层测试

```bash
npm test
```

## 目录结构

```text
.
├── apps
│   ├── desktop
│   │   ├── electron
│   │   ├── src
│   │   └── package.json
│   └── mobile
│       ├── src
│       ├── App.tsx
│       └── package.json
├── packages
│   └── core
│       ├── src
│       └── package.json
├── package.json
└── tsconfig.base.json
```

## 迁移原则

- 不直接把桌面端 UI 改成 RN
- 共享数据层与纯逻辑，分别重写桌面 / 移动端 UI
- 先保证桌面端可继续发版，再逐步扩展移动端能力

## 已验证

- `npm test`
- `npm run core:typecheck`
- `npm run mobile:typecheck`
- `npm run desktop:build`
