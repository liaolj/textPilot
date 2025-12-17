/**
 * 数据模型类型定义
 */

// 模型类型
export enum ModelType {
  OPENAI = 'openai',
  CLAUDE = 'claude',
  OLLAMA = 'ollama',
  CUSTOM = 'custom'
}

// 模型配置
export interface ModelConfig {
  id: string;
  name: string;
  type: ModelType;
  apiKey?: string;
  baseUrl?: string;
  modelName: string;
  isDefault?: boolean;
  createdAt: number;
  updatedAt: number;
}

// 模板
export interface Template {
  id: string;
  name: string;
  icon: string;
  prompt: string;
  hotkey?: string;
  modelId?: string; // 指定使用的模型，为空则使用默认模型
  isBuiltIn: boolean; // 是否为内置模板
  createdAt: number;
  updatedAt: number;
}

// 用户偏好
export interface UserPreferences {
  writingStyle: WritingStyle;
  domain: Domain;
  language: Language;
  personalInfo: PersonalInfo;
  longTermContext: string;
}

export enum WritingStyle {
  FORMAL = 'formal',
  CASUAL = 'casual',
  CONCISE = 'concise',
  DETAILED = 'detailed'
}

export enum Domain {
  TECH = 'tech',
  BUSINESS = 'business',
  ACADEMIC = 'academic',
  CREATIVE = 'creative',
  GENERAL = 'general'
}

export enum Language {
  ZH_CN = 'zh-CN',
  EN_US = 'en-US',
  AUTO = 'auto'
}

export interface PersonalInfo {
  name?: string;
  company?: string;
  position?: string;
  email?: string;
  signature?: string;
  [key: string]: string | undefined; // 支持自定义字段
}

// 历史记录
export interface HistoryRecord {
  id: string;
  original: string; // 原文
  result: string; // 结果
  templateId: string;
  templateName: string;
  modelId: string;
  modelName: string;
  isFavorite: boolean;
  createdAt: number;
}

// 应用配置
export interface AppConfig {
  globalHotkey: string;
  language: Language;
  defaultModelId?: string;
  recentActions: string[]; // 最近使用的模板ID列表
  windowBounds?: {
    width: number;
    height: number;
    x?: number;
    y?: number;
  };
  theme: 'light' | 'dark' | 'system';
}

// 快捷键冲突信息
export interface HotkeyConflict {
  hotkey: string;
  conflictWith: string[]; // 冲突的应用或系统快捷键
}

// AI 处理请求
export interface AIProcessRequest {
  prompt: string;
  modelId: string;
  systemPrompt?: string;
}

// AI 处理响应
export interface AIProcessResponse {
  content: string;
  modelUsed: string;
  tokensUsed?: number;
  error?: string;
}

// 模板变量上下文
export interface TemplateContext {
  clipboard: string;
  date: string;
  time: string;
  user: PersonalInfo;
  [key: string]: any;
}
