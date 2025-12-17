/**
 * Preload 脚本
 * 通过 contextBridge 暴露安全的 API 给渲染进程
 */

import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI } from '../src/types/api';

// 暴露 API 到渲染进程
const electronAPI: ElectronAPI = {
  // 剪贴板
  clipboard: {
    read: () => ipcRenderer.invoke('clipboard:read'),
    write: (text: string) => ipcRenderer.invoke('clipboard:write', text)
  },

  // 快捷键
  hotkey: {
    register: (hotkey: string, actionId: string) =>
      ipcRenderer.invoke('hotkey:register', hotkey, actionId),
    unregister: (actionId: string) =>
      ipcRenderer.invoke('hotkey:unregister', actionId),
    checkConflict: (hotkey: string) =>
      ipcRenderer.invoke('hotkey:check-conflict', hotkey)
  },

  // AI 处理
  ai: {
    process: (request) => ipcRenderer.invoke('ai:process', request)
  },

  // 存储 - 应用配置
  config: {
    get: () => ipcRenderer.invoke('config:get'),
    save: (config) => ipcRenderer.invoke('config:save', config)
  },

  // 存储 - 模型配置
  models: {
    getAll: () => ipcRenderer.invoke('models:get-all'),
    get: (id: string) => ipcRenderer.invoke('models:get', id),
    save: (model) => ipcRenderer.invoke('models:save', model),
    delete: (id: string) => ipcRenderer.invoke('models:delete', id)
  },

  // 存储 - 模板
  templates: {
    getAll: () => ipcRenderer.invoke('templates:get-all'),
    get: (id: string) => ipcRenderer.invoke('templates:get', id),
    save: (template) => ipcRenderer.invoke('templates:save', template),
    delete: (id: string) => ipcRenderer.invoke('templates:delete', id),
    import: (data) => ipcRenderer.invoke('templates:import', data),
    export: () => ipcRenderer.invoke('templates:export')
  },

  // 存储 - 用户偏好
  preferences: {
    get: () => ipcRenderer.invoke('preferences:get'),
    save: (preferences) => ipcRenderer.invoke('preferences:save', preferences)
  },

  // 历史记录
  history: {
    add: (record) => ipcRenderer.invoke('history:add', record),
    search: (query: string) => ipcRenderer.invoke('history:search', query),
    getAll: (limit?: number, offset?: number) =>
      ipcRenderer.invoke('history:get-all', limit, offset),
    toggleFavorite: (id: string) =>
      ipcRenderer.invoke('history:toggle-favorite', id),
    delete: (id: string) => ipcRenderer.invoke('history:delete', id),
    deleteByDateRange: (startDate: number, endDate: number) =>
      ipcRenderer.invoke('history:delete-by-date-range', startDate, endDate)
  },

  // 窗口控制
  window: {
    show: () => ipcRenderer.send('window:show'),
    hide: () => ipcRenderer.send('window:hide'),
    close: () => ipcRenderer.send('window:close'),
    minimize: () => ipcRenderer.send('window:minimize')
  },

  // 事件监听
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_event, ...args) => callback(...args));
  },

  off: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  }
};

// 将 API 暴露到 window.electronAPI
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
