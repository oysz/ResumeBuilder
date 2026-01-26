/**
 * AI 服务 - 调用智谱 AI API
 */

import CryptoJS from 'crypto-js';
import type {
  GLMChatRequest,
  GLMChatResponse,
  StreamChunk,
  ChatMessage,
} from '../types/ai.types';

// API 端点
const API_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

// 本地存储 key
const STORAGE_KEY = 'ai_api_key_encrypted';

// 加密密钥（使用固定盐值）
const SECRET_KEY = 'resume-builder-ai-secret-2024';

/**
 * 加密并保存 API Key
 */
export function saveApiKey(apiKey: string): void {
  if (!apiKey || apiKey.trim() === '') {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  const encrypted = CryptoJS.AES.encrypt(apiKey, SECRET_KEY).toString();
  localStorage.setItem(STORAGE_KEY, encrypted);
}

/**
 * 解密并获取 API Key
 */
export function getApiKey(): string | null {
  const encrypted = localStorage.getItem(STORAGE_KEY);
  if (!encrypted) return null;

  try {
    const decrypted = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Failed to decrypt API key:', error);
    return null;
  }
}

/**
 * 检查是否已配置 API Key
 */
export function hasApiKey(): boolean {
  return getApiKey() !== null;
}

/**
 * 构建系统提示词
 */
function buildSystemPrompt(context?: string): string {
  const basePrompt = `你是一位专业的简历顾问和写作助手。你的任务是帮助用户优化简历内容，使其更加专业、有吸引力。

你的能力包括：
1. 优化工作经历描述，使其更加简洁、有力
2. 生成专业的自我介绍和求职信
3. 根据职位描述（JD）调整简历内容
4. 改进简历的语言表达和专业性

请遵循以下原则：
- 使用专业的职场语言
- 量化成果（使用数字、百分比等）
- 使用动作动词开头
- 保持简洁，去除冗余
- 突出核心技能和成就

回复时请使用 Markdown 格式，保持简洁专业。`;

  if (context) {
    return `${basePrompt}\n\n当前简历上下文：\n${context}`;
  }

  return basePrompt;
}

/**
 * 调用智谱 AI API（非流式）
 */
export async function callGLMAPI(
  messages: ChatMessage[],
  model: string = 'glm-4',
  temperature: number = 0.7,
  maxTokens: number = 2000
): Promise<string> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('请先配置 API Key');
  }

  // 构建请求
  const request: GLMChatRequest = {
    model: model as any,
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
    temperature,
    max_tokens: maxTokens,
  };

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API 请求失败: ${response.status} - ${error}`);
    }

    const data: GLMChatResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('GLM API Error:', error);
    throw error;
  }
}

/**
 * 调用智谱 AI API（流式）
 */
export async function callGLMAPIStream(
  messages: ChatMessage[],
  onChunk: (content: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void,
  model: string = 'glm-4',
  temperature: number = 0.7,
  maxTokens: number = 2000
): Promise<void> {
  const apiKey = getApiKey();

  if (!apiKey) {
    onError(new Error('请先配置 API Key'));
    return;
  }

  // 构建请求
  const request: GLMChatRequest = {
    model: model as any,
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
    stream: true,
    temperature,
    max_tokens: maxTokens,
  };

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API 请求失败: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onComplete();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') {
            onComplete();
            return;
          }

          try {
            const chunk: StreamChunk = JSON.parse(data);
            const content = chunk.choices[0]?.delta?.content;

            if (content) {
              onChunk(content);
            }

            if (chunk.choices[0]?.finish_reason) {
              onComplete();
              return;
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  } catch (error) {
    console.error('GLM API Stream Error:', error);
    onError(error as Error);
  }
}

/**
 * 快捷操作 - 优化描述
 */
export function optimizeDescription(text: string): Promise<string> {
  const messages: ChatMessage[] = [
    {
      id: '1',
      role: 'system',
      content: buildSystemPrompt(),
      timestamp: Date.now(),
    },
    {
      id: '2',
      role: 'user',
      content: `请优化以下简历内容，使其更加专业、简洁、有力：\n\n${text}`,
      timestamp: Date.now(),
    },
  ];

  return callGLMAPI(messages);
}

/**
 * 快捷操作 - 生成自我介绍
 */
export function generateIntroduction(resumeData: any): Promise<string> {
  const messages: ChatMessage[] = [
    {
      id: '1',
      role: 'system',
      content: buildSystemPrompt(JSON.stringify(resumeData)),
      timestamp: Date.now(),
    },
    {
      id: '2',
      role: 'user',
      content: '请为这份简历生成一段简洁、专业的自我介绍（100-150字）',
      timestamp: Date.now(),
    },
  ];

  return callGLMAPI(messages);
}

/**
 * 快捷操作 - 润色工作经历
 */
export function polishExperience(experience: string): Promise<string> {
  const messages: ChatMessage[] = [
    {
      id: '1',
      role: 'system',
      content: buildSystemPrompt(),
      timestamp: Date.now(),
    },
    {
      id: '2',
      role: 'user',
      content: `请润色以下工作经历描述，使其更加专业和吸引人：\n\n${experience}\n\n请保持原有事实，只是改进表达方式。`,
      timestamp: Date.now(),
    },
  ];

  return callGLMAPI(messages);
}

/**
 * 快捷操作 - 匹配职位描述
 */
export function matchJobDescription(resumeData: any, jd: string): Promise<string> {
  const messages: ChatMessage[] = [
    {
      id: '1',
      role: 'system',
      content: buildSystemPrompt(),
      timestamp: Date.now(),
    },
    {
      id: '2',
      role: 'user',
      content: `请分析以下职位描述，并给出简历优化建议：\n\n职位描述：\n${jd}\n\n请告诉我：1. 简历中需要强调哪些技能和经验？2. 哪些关键词应该包含在简历中？3. 有哪些需要补充的内容？`,
      timestamp: Date.now(),
    },
  ];

  return callGLMAPI(messages);
}

// ============ AI 润色功能 ============

import type { PolishMode, PolishRequest } from '@/types/ai.types';

/**
 * 构建润色提示词
 */
function buildPolishPrompt(mode: PolishMode, content: string, context?: string): string {
  const prompts = {
    polish: `请润色以下内容，使其更加专业、流畅、有吸引力。

要求：
1. 改进语言表达，使用更专业的词汇
2. 优化句子结构，使表达更流畅
3. 保持原意不变，不要添加虚构信息
4. 适当添加动作动词和量化表达

原内容：
${content}

请只返回润色后的内容，不要包含任何解释。`,

    expand: `请扩展以下内容，使其更加丰富、详细。

要求：
1. 增加具体细节和实例
2. 补充相关的技能和经验
3. 量化成果（使用数字、百分比等）
4. 使内容更加立体和有说服力
5. 控制在原内容的2-3倍长度

原内容：
${content}

请只返回扩展后的内容，不要包含任何解释。`,

    simplify: `请精简以下内容，提炼核心要点。

要求：
1. 去除冗余和无关信息
2. 保留最重要的关键信息
3. 使用简洁有力的表达
4. 如果是工作经历，转换为要点格式（每个要点一行）
5. 控制在原内容的50%-70%长度

原内容：
${content}

请只返回精简后的内容，不要包含任何解释。`,

    format: `请将以下内容格式化为专业的简历要点。

要求：
1. 使用要点格式（每行一个要点，以 • 或数字开头）
2. 每个要点以动作动词开头（如"负责"、"开发"、"实现"等）
3. 量化成果（加入数字、百分比等）
4. 突出核心技能和成就
5. 使内容更易读、更有冲击力

原内容：
${content}

请只返回格式化后的内容，不要包含任何解释。`
  };

  let prompt = prompts[mode];

  if (context) {
    prompt = `这是简历中的【${context}】部分。\n\n${prompt}`;
  }

  return prompt;
}

/**
 * AI 润色（非流式）
 */
export function polishContent(
  content: string,
  mode: PolishMode,
  context?: string
): Promise<string> {
  const messages: ChatMessage[] = [
    {
      id: '1',
      role: 'system',
      content: buildSystemPrompt(),
      timestamp: Date.now(),
    },
    {
      id: '2',
      role: 'user',
      content: buildPolishPrompt(mode, content, context),
      timestamp: Date.now(),
    },
  ];

  return callGLMAPI(messages);
}

/**
 * AI 润色（流式）
 */
export function polishContentStream(
  content: string,
  mode: PolishMode,
  onChunk: (text: string) => void,
  onComplete: (finalText: string) => void,
  onError: (error: Error) => void,
  context?: string
): void {
  const messages: ChatMessage[] = [
    {
      id: '1',
      role: 'system',
      content: buildSystemPrompt(),
      timestamp: Date.now(),
    },
    {
      id: '2',
      role: 'user',
      content: buildPolishPrompt(mode, content, context),
      timestamp: Date.now(),
    },
  ];

  let fullContent = '';

  callGLMAPIStream(
    messages,
    (chunk) => {
      fullContent += chunk;
      onChunk(chunk);
    },
    () => {
      onComplete(fullContent);
    },
    onError
  );
}

/**
 * 获取润色模式配置
 */
export function getPolishModeConfig(mode: PolishMode) {
  const configs: Record<PolishMode, { label: string; description: string; icon: string; color: string }> = {
    polish: {
      label: '基础润色',
      description: '改进语言表达，使其更专业流畅',
      icon: '✨',
      color: 'purple'
    },
    expand: {
      label: '内容扩展',
      description: '增加更多细节，使内容更丰富',
      icon: '📝',
      color: 'blue'
    },
    simplify: {
      label: '精简内容',
      description: '提炼核心要点，去除冗余',
      icon: '🎯',
      color: 'green'
    },
    format: {
      label: '格式优化',
      description: '转换为专业的简历要点格式',
      icon: '📋',
      color: 'orange'
    }
  };

  return configs[mode];
}
