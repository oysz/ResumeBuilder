# 更新 GitHub Token 权限

## 问题

当前 GitHub Token 缺少 `workflow` 权限，无法推送 GitHub Actions 配置文件。

## 解决方案

### 步骤 1：生成新的 GitHub Token

1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 设置 Token 名称：`ResumeBuilder Workflow`
4. 勾选以下权限：
   - ✅ `repo` (完整仓库访问权限)
   - ✅ `workflow` (GitHub Actions 权限) ⭐ **新增**
   - ✅ `write:packages` (如果需要)

5. 点击底部 "Generate token" 按钮
6. **立即复制 token**（只显示一次！）

### 步骤 2：更新本地 Git 配置

```bash
# 方式一：更新远程 URL（使用新 token）
git remote set-url origin https://新_token@github.com/oysz/ResumeBuilder.git

# 方式二：更新环境变量
export GH_TOKEN="你的新_token"
```

### 步骤 3：推送代码

```bash
git push origin master
```

## 验证

推送成功后，访问：
https://github.com/oysz/ResumeBuilder/actions

应该能看到 Actions 页面。

## 测试自动构建

推送完成后，创建一个新的 tag 来测试：

```bash
# 修改版本号（可选）
vim package.json  # 改为 1.0.3

# 提交
git add .
git commit -m "chore: 准备发布 v1.0.3"

# 打 tag
git tag v1.0.3

# 推送
git push origin master
git push origin v1.0.3
```

GitHub Actions 会自动：
1. 检测到新的 tag
2. 开始构建 3 个平台（macOS、Windows、Linux）
3. 自动上传到 v1.0.3 Release

构建进度：
https://github.com/oysz/ResumeBuilder/actions

## 注意事项

- **macOS**: 在 macOS runner 上构建（约 5-10 分钟）
- **Windows**: 在 Windows runner 上构建（约 5-10 分钟）
- **Linux**: 在 Ubuntu runner 上构建（约 5-10 分钟）

总共约 **15-30 分钟**完成所有平台构建。
