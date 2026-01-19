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
