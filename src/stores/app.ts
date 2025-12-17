/**
 * 应用全局状态
 */

import { create } from 'zustand';
import type { AppConfig, Template } from '../types/models';

interface AppState {
  // 当前视图
  currentView: 'main' | 'preview' | 'settings' | 'history';

  // 配置
  config: AppConfig | null;

  // 模板列表
  templates: Template[];

  // 搜索关键词
  searchQuery: string;

  // 选中的模板
  selectedTemplateId: string | null;

  // 预览数据
  previewData: {
    templateId: string;
    templateName: string;
    original: string;
    result: string;
  } | null;

  // Actions
  setCurrentView: (view: 'main' | 'preview' | 'settings' | 'history') => void;
  setConfig: (config: AppConfig) => void;
  setTemplates: (templates: Template[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTemplateId: (id: string | null) => void;
  setPreviewData: (data: any) => void;
  loadInitialData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'main',
  config: null,
  templates: [],
  searchQuery: '',
  selectedTemplateId: null,
  previewData: null,

  setCurrentView: (view) => set({ currentView: view }),
  setConfig: (config) => set({ config }),
  setTemplates: (templates) => set({ templates }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTemplateId: (id) => set({ selectedTemplateId: id }),
  setPreviewData: (data) => set({ previewData: data, currentView: 'preview' }),

  loadInitialData: async () => {
    try {
      const [config, templates] = await Promise.all([
        window.electronAPI.config.get(),
        window.electronAPI.templates.getAll()
      ]);

      set({ config, templates });
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  }
}));
