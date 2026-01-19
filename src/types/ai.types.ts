/**
 * AI 助手相关类型定义
 */

// 聊天消息角色
export type MessageRole = 'user' | 'assistant' | 'system';

// 聊天消息
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

// 智谱 API 请求消息
export interface GLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
}

// 智谱 API 请求参数
export interface GLMChatRequest {
  model: 'glm-4' | 'glm-4-plus' | 'glm-4-0520' | 'glm-4-air' | 'glm-4-flash' | 'glm-4v';
  messages: GLMMessage[];
  stream?: boolean;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}

// 智谱 API 响应
export interface GLMChatResponse {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 流式响应片段
export interface StreamChunk {
  id: string;
  choices: Array<{
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

// AI 配置
export interface AIConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

// 快捷操作类型
export type QuickAction =
  | 'optimize-description'
  | 'generate-intro'
  | 'polish-experience'
  | 'match-jd';

// 快捷操作配置
export interface QuickActionConfig {
  id: QuickAction;
  label: string;
  prompt: string;
  icon: string;
}

// AI 面板状态
export interface AIPanelState {
  isOpen: boolean;
  hasApiKey: boolean;
  isStreaming: boolean;
}
