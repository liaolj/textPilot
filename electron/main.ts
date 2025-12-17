/**
 * Electron 主进程
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

// 服务导入
import { clipboardService } from './services/clipboard';
import { hotkeyService } from './services/hotkey';
import { trayService } from './services/tray';
import { aiService } from './services/ai';
import { historyService } from './services/history';
import {
  configService,
  modelsService,
  templatesService,
  preferencesService
} from './services/storage';
import { createTemplateContext, replaceTemplateVariables } from './utils/template';

// 主窗口实例
let mainWindow: BrowserWindow | null = null;

// 开发环境判断
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

/**
 * 创建主窗口
 */
function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 500,
    show: false,
    frame: false,
    resizable: false,
    transparent: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // 加载页面
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // 窗口就绪后居中显示
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.center();
    }
  });

  // 失去焦点时隐藏 (Raycast 风格)
  mainWindow.on('blur', () => {
    if (mainWindow && !isDev) {
      mainWindow.hide();
    }
  });

  // 窗口关闭时
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 设置服务引用
  hotkeyService.setMainWindow(mainWindow);
  trayService.setMainWindow(mainWindow);
}

/**
 * 显示主窗口
 */
function showMainWindow(): void {
  if (mainWindow) {
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }
    mainWindow.focus();
  }
}

/**
 * 注册全局快捷键
 */
function registerGlobalHotkeys(): void {
  const config = configService.get();

  // 注册全局唤起快捷键
  hotkeyService.register(config.globalHotkey, '__global__', () => {
    showMainWindow();
  });

  // 注册模板快捷键
  const templates = templatesService.getAll();
  for (const template of templates) {
    if (template.hotkey) {
      hotkeyService.register(template.hotkey, template.id, () => {
        // 直接执行模板
        executeTemplate(template.id);
      });
    }
  }
}

/**
 * 执行模板
 */
async function executeTemplate(templateId: string): Promise<void> {
  try {
    const template = templatesService.get(templateId);
    if (!template) {
      console.error(`Template not found: ${templateId}`);
      return;
    }

    // 读取剪贴板
    const clipboardContent = clipboardService.read();

    // 获取用户偏好
    const preferences = preferencesService.get();

    // 创建模板上下文
    const context = createTemplateContext(clipboardContent, preferences.personalInfo);

    // 替换模板变量
    const userPrompt = replaceTemplateVariables(template.prompt, context);

    // 生成系统提示词
    const systemPrompt = preferencesService.generateSystemPrompt();

    // 获取模型ID
    const modelId = template.modelId || configService.get().defaultModelId;
    if (!modelId) {
      console.error('No model configured');
      return;
    }

    // 调用 AI 处理
    const response = await aiService.process({
      prompt: userPrompt,
      modelId,
      systemPrompt
    });

    if (response.error) {
      console.error('AI processing error:', response.error);
      return;
    }

    // 发送结果到渲染进程预览
    if (mainWindow) {
      mainWindow.webContents.send('show-preview', {
        templateId,
        templateName: template.name,
        original: clipboardContent,
        result: response.content
      });
      showMainWindow();
    }

    // 更新最近使用
    configService.addRecentAction(templateId);
  } catch (error) {
    console.error('Execute template error:', error);
  }
}

/**
 * 注册 IPC 处理器
 */
function registerIPCHandlers(): void {
  // 剪贴板
  ipcMain.handle('clipboard:read', () => clipboardService.read());
  ipcMain.handle('clipboard:write', (_event, text: string) => clipboardService.write(text));

  // 快捷键
  ipcMain.handle('hotkey:register', (_event, hotkey: string, actionId: string) => {
    return hotkeyService.register(hotkey, actionId, () => {
      if (actionId.startsWith('template_')) {
        executeTemplate(actionId);
      }
    });
  });
  ipcMain.handle('hotkey:unregister', (_event, actionId: string) => {
    hotkeyService.unregister(actionId);
  });
  ipcMain.handle('hotkey:check-conflict', (_event, hotkey: string) => {
    return hotkeyService.checkConflict(hotkey);
  });

  // AI 处理
  ipcMain.handle('ai:process', async (_event, request) => {
    return await aiService.process(request);
  });

  // 配置
  ipcMain.handle('config:get', () => configService.get());
  ipcMain.handle('config:save', (_event, config) => configService.save(config));

  // 模型
  ipcMain.handle('models:get-all', () => modelsService.getAll());
  ipcMain.handle('models:get', (_event, id: string) => modelsService.get(id));
  ipcMain.handle('models:save', (_event, model) => modelsService.save(model));
  ipcMain.handle('models:delete', (_event, id: string) => modelsService.delete(id));

  // 模板
  ipcMain.handle('templates:get-all', () => templatesService.getAll());
  ipcMain.handle('templates:get', (_event, id: string) => templatesService.get(id));
  ipcMain.handle('templates:save', (_event, template) => templatesService.save(template));
  ipcMain.handle('templates:delete', (_event, id: string) => templatesService.delete(id));
  ipcMain.handle('templates:import', (_event, data) => templatesService.import(data));
  ipcMain.handle('templates:export', () => templatesService.export());

  // 用户偏好
  ipcMain.handle('preferences:get', () => preferencesService.get());
  ipcMain.handle('preferences:save', (_event, preferences) => preferencesService.save(preferences));

  // 历史记录
  ipcMain.handle('history:add', (_event, record) => historyService.add(record));
  ipcMain.handle('history:search', (_event, query: string) => historyService.search(query));
  ipcMain.handle('history:get-all', (_event, limit?: number, offset?: number) =>
    historyService.getAll(limit, offset)
  );
  ipcMain.handle('history:toggle-favorite', (_event, id: string) =>
    historyService.toggleFavorite(id)
  );
  ipcMain.handle('history:delete', (_event, id: string) => historyService.delete(id));
  ipcMain.handle('history:delete-by-date-range', (_event, startDate: number, endDate: number) =>
    historyService.deleteByDateRange(startDate, endDate)
  );

  // 窗口控制
  ipcMain.on('window:show', () => showMainWindow());
  ipcMain.on('window:hide', () => mainWindow?.hide());
  ipcMain.on('window:close', () => mainWindow?.close());
  ipcMain.on('window:minimize', () => mainWindow?.minimize());

  // 执行模板
  ipcMain.handle('template:execute', (_event, templateId: string) => {
    executeTemplate(templateId);
  });
}

/**
 * 初始化内置模板
 */
function initBuiltInTemplates(): void {
  const templates = templatesService.getAll();
  if (templates.length > 0) return; // 已有模板,不重复初始化

  const now = Date.now();

  const builtInTemplates = [
    {
      id: 'builtin_polish',
      name: '润色文本',
      icon: '✨',
      prompt: '请润色以下文本,保持原意,使表达更流畅专业:\n\n{{clipboard}}',
      isBuiltIn: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'builtin_translate',
      name: '翻译成英文',
      icon: '🌐',
      prompt: '请将以下内容翻译成地道的英文:\n\n{{clipboard}}',
      isBuiltIn: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'builtin_expand',
      name: '扩写',
      icon: '📝',
      prompt: '请基于以下内容进行扩写,丰富细节和论述,使内容更加完整充实:\n\n{{clipboard}}',
      isBuiltIn: true,
      createdAt: now,
      updatedAt: now
    }
  ];

  for (const template of builtInTemplates) {
    templatesService.save(template);
  }

  console.log('Built-in templates initialized');
}

/**
 * App 就绪
 */
app.whenReady().then(() => {
  // 初始化内置模板
  initBuiltInTemplates();

  // 创建主窗口
  createMainWindow();

  // 注册 IPC 处理器
  registerIPCHandlers();

  // 注册全局快捷键
  registerGlobalHotkeys();

  // 创建系统托盘
  trayService.create();

  // macOS 特殊处理
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

/**
 * 所有窗口关闭
 */
app.on('window-all-closed', () => {
  // macOS 除外,保持应用运行
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * App 退出前
 */
app.on('will-quit', () => {
  // 注销所有快捷键
  hotkeyService.unregisterAll();

  // 关闭数据库
  historyService.close();

  // 销毁托盘
  trayService.destroy();
});
