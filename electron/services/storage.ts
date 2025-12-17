/**
 * 本地存储服务
 * 使用 electron-store 管理 JSON 配置
 */

import Store from 'electron-store';
import type {
  AppConfig,
  ModelConfig,
  Template,
  UserPreferences,
  Language,
  WritingStyle,
  Domain
} from '../../src/types/models';
import { encryptModelConfig, decryptModelConfig } from '../utils/encryption';

// 默认配置
const DEFAULT_APP_CONFIG: AppConfig = {
  globalHotkey: 'CommandOrControl+Shift+V',
  language: Language.ZH_CN,
  recentActions: [],
  theme: 'system'
};

const DEFAULT_USER_PREFERENCES: UserPreferences = {
  writingStyle: WritingStyle.CONCISE,
  domain: Domain.GENERAL,
  language: Language.AUTO,
  personalInfo: {},
  longTermContext: ''
};

// 初始化 Store
const configStore = new Store<{ config: AppConfig }>({
  name: 'config',
  defaults: {
    config: DEFAULT_APP_CONFIG
  }
});

const modelsStore = new Store<{ models: ModelConfig[] }>({
  name: 'models',
  defaults: {
    models: []
  }
});

const templatesStore = new Store<{ templates: Template[] }>({
  name: 'templates',
  defaults: {
    templates: []
  }
});

const preferencesStore = new Store<{ preferences: UserPreferences }>({
  name: 'preferences',
  defaults: {
    preferences: DEFAULT_USER_PREFERENCES
  }
});

/**
 * 应用配置服务
 */
export class ConfigService {
  get(): AppConfig {
    return configStore.get('config');
  }

  save(config: AppConfig): void {
    configStore.set('config', config);
  }

  update(partial: Partial<AppConfig>): void {
    const current = this.get();
    this.save({ ...current, ...partial });
  }

  addRecentAction(templateId: string, maxRecent: number = 10): void {
    const config = this.get();
    const recent = config.recentActions.filter(id => id !== templateId);
    recent.unshift(templateId);
    this.update({
      recentActions: recent.slice(0, maxRecent)
    });
  }
}

/**
 * 模型配置服务
 */
export class ModelsService {
  getAll(): ModelConfig[] {
    const models = modelsStore.get('models', []);
    return models.map(decryptModelConfig);
  }

  get(id: string): ModelConfig | null {
    const models = this.getAll();
    return models.find(m => m.id === id) || null;
  }

  save(model: ModelConfig): void {
    const models = modelsStore.get('models', []);
    const index = models.findIndex(m => m.id === model.id);

    const encryptedModel = encryptModelConfig(model);

    if (index >= 0) {
      models[index] = encryptedModel;
    } else {
      models.push(encryptedModel);
    }

    modelsStore.set('models', models);
  }

  delete(id: string): void {
    const models = modelsStore.get('models', []);
    const filtered = models.filter(m => m.id !== id);
    modelsStore.set('models', filtered);
  }

  setDefault(id: string): void {
    const configService = new ConfigService();
    configService.update({ defaultModelId: id });
  }

  getDefault(): ModelConfig | null {
    const configService = new ConfigService();
    const config = configService.get();

    if (config.defaultModelId) {
      return this.get(config.defaultModelId);
    }

    // 如果没有设置默认模型,返回第一个
    const models = this.getAll();
    return models.length > 0 ? models[0] : null;
  }
}

/**
 * 模板服务
 */
export class TemplatesService {
  getAll(): Template[] {
    return templatesStore.get('templates', []);
  }

  get(id: string): Template | null {
    const templates = this.getAll();
    return templates.find(t => t.id === id) || null;
  }

  save(template: Template): void {
    const templates = templatesStore.get('templates', []);
    const index = templates.findIndex(t => t.id === template.id);

    if (index >= 0) {
      templates[index] = template;
    } else {
      templates.push(template);
    }

    templatesStore.set('templates', templates);
  }

  delete(id: string): void {
    const templates = templatesStore.get('templates', []);
    const filtered = templates.filter(t => t.id !== id);
    templatesStore.set('templates', filtered);
  }

  import(data: Template[]): void {
    const existing = this.getAll();
    const merged = [...existing];

    for (const template of data) {
      const index = merged.findIndex(t => t.id === template.id);
      if (index >= 0) {
        merged[index] = template;
      } else {
        merged.push(template);
      }
    }

    templatesStore.set('templates', merged);
  }

  export(): Template[] {
    return this.getAll();
  }
}

/**
 * 用户偏好服务
 */
export class PreferencesService {
  get(): UserPreferences {
    return preferencesStore.get('preferences');
  }

  save(preferences: UserPreferences): void {
    preferencesStore.set('preferences', preferences);
  }

  update(partial: Partial<UserPreferences>): void {
    const current = this.get();
    this.save({ ...current, ...partial });
  }

  /**
   * 生成系统提示词 (包含用户偏好)
   */
  generateSystemPrompt(): string {
    const prefs = this.get();
    const parts: string[] = [];

    // 长期上下文
    if (prefs.longTermContext.trim()) {
      parts.push(prefs.longTermContext.trim());
    }

    // 写作风格
    const styleMap = {
      [WritingStyle.FORMAL]: '请使用正式、专业的语言风格',
      [WritingStyle.CASUAL]: '请使用轻松、自然的语言风格',
      [WritingStyle.CONCISE]: '请保持简洁、精炼的表达',
      [WritingStyle.DETAILED]: '请提供详细、充分的内容'
    };
    parts.push(styleMap[prefs.writingStyle]);

    // 专业领域
    const domainMap = {
      [Domain.TECH]: '技术',
      [Domain.BUSINESS]: '商务',
      [Domain.ACADEMIC]: '学术',
      [Domain.CREATIVE]: '创意',
      [Domain.GENERAL]: '通用'
    };
    parts.push(`内容领域:${domainMap[prefs.domain]}`);

    // 语言偏好
    if (prefs.language !== Language.AUTO) {
      const langMap = {
        [Language.ZH_CN]: '请使用中文回复',
        [Language.EN_US]: 'Please respond in English'
      };
      parts.push(langMap[prefs.language]);
    }

    return parts.join('\n');
  }
}

// 导出单例
export const configService = new ConfigService();
export const modelsService = new ModelsService();
export const templatesService = new TemplatesService();
export const preferencesService = new PreferencesService();
