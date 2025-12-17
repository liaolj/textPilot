/**
 * Electron IPC API 类型定义
 */

import type {
  AppConfig,
  ModelConfig,
  Template,
  UserPreferences,
  HistoryRecord,
  AIProcessRequest,
  AIProcessResponse
} from './models';

// Electron API 接口
export interface ElectronAPI {
  // 剪贴板
  clipboard: {
    read: () => Promise<string>;
    write: (text: string) => Promise<void>;
  };

  // 快捷键
  hotkey: {
    register: (hotkey: string, actionId: string) => Promise<boolean>;
    unregister: (actionId: string) => Promise<void>;
    checkConflict: (hotkey: string) => Promise<string[]>;
  };

  // AI 处理
  ai: {
    process: (request: AIProcessRequest) => Promise<AIProcessResponse>;
  };

  // 存储 - 应用配置
  config: {
    get: () => Promise<AppConfig>;
    save: (config: AppConfig) => Promise<void>;
  };

  // 存储 - 模型配置
  models: {
    getAll: () => Promise<ModelConfig[]>;
    get: (id: string) => Promise<ModelConfig | null>;
    save: (model: ModelConfig) => Promise<void>;
    delete: (id: string) => Promise<void>;
  };

  // 存储 - 模板
  templates: {
    getAll: () => Promise<Template[]>;
    get: (id: string) => Promise<Template | null>;
    save: (template: Template) => Promise<void>;
    delete: (id: string) => Promise<void>;
    import: (data: Template[]) => Promise<void>;
    export: () => Promise<Template[]>;
  };

  // 存储 - 用户偏好
  preferences: {
    get: () => Promise<UserPreferences>;
    save: (preferences: UserPreferences) => Promise<void>;
  };

  // 历史记录
  history: {
    add: (record: Omit<HistoryRecord, 'id' | 'createdAt'>) => Promise<HistoryRecord>;
    search: (query: string) => Promise<HistoryRecord[]>;
    getAll: (limit?: number, offset?: number) => Promise<HistoryRecord[]>;
    toggleFavorite: (id: string) => Promise<void>;
    delete: (id: string) => Promise<void>;
    deleteByDateRange: (startDate: number, endDate: number) => Promise<void>;
  };

  // 窗口控制
  window: {
    show: () => void;
    hide: () => void;
    close: () => void;
    minimize: () => void;
  };

  // 事件监听
  on: (channel: string, callback: (...args: any[]) => void) => void;
  off: (channel: string, callback: (...args: any[]) => void) => void;
}

// 扩展 Window 接口
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
