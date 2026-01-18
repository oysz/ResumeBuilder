#!/bin/bash

# macOS 应用完整签名脚本
# 使用 ad-hoc 签名为所有组件签名

APP_PATH="$1"

if [ -z "$APP_PATH" ]; then
  echo "用法: $1 <app路径>"
  exit 1
fi

echo "📝 开始签名应用: $APP_PATH"

# 1. 移除所有现有签名
echo "🔧 移除旧签名..."
codesign --remove-signature "$APP_PATH" 2>/dev/null || true

# 2. 为所有 Helper 应用签名
echo "🔧 签名 Helper 应用..."
find "$APP_PATH/Contents/Frameworks" -name "*.app" -type d | while read helper; do
  echo "  签名: $(basename "$helper")"
  codesign --force --deep --sign - "$helper" 2>/dev/null || true
done

# 3. 为所有 Frameworks 签名
echo "🔧 签名 Frameworks..."
find "$APP_PATH/Contents/Frameworks" -name "*.framework" -type d | while read framework; do
  echo "  签名: $(basename "$framework")"
  codesign --force --deep --sign - "$framework" 2>/dev/null || true
done

# 4. 为主应用签名
echo "🔧 签名主应用..."
codesign --force --deep --sign - "$APP_PATH"

# 5. 验证签名
echo "✅ 验证签名..."
codesign -dv "$APP_PATH" 2>&1 | head -10

echo "✅ 签名完成！"
