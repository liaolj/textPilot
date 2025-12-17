/**
 * 全局快捷键服务
 */

import { globalShortcut, BrowserWindow } from 'electron';

type HotkeyCallback = () => void;

interface HotkeyRegistration {
  hotkey: string;
  actionId: string;
  callback: HotkeyCallback;
}

/**
 * 快捷键服务
 */
export class HotkeyService {
  private registrations: Map<string, HotkeyRegistration> = new Map();
  private mainWindow: BrowserWindow | null = null;

  /**
   * 设置主窗口引用
   */
  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  /**
   * 注册全局快捷键
   */
  register(hotkey: string, actionId: string, callback: HotkeyCallback): boolean {
    // 检查快捷键格式
    if (!this.isValidHotkey(hotkey)) {
      console.error(`Invalid hotkey format: ${hotkey}`);
      return false;
    }

    // 先注销已存在的相同 actionId 的快捷键
    this.unregister(actionId);

    // 尝试注册
    const success = globalShortcut.register(hotkey, callback);

    if (success) {
      this.registrations.set(actionId, { hotkey, actionId, callback });
      console.log(`Registered hotkey: ${hotkey} for action: ${actionId}`);
    } else {
      console.error(`Failed to register hotkey: ${hotkey}`);
    }

    return success;
  }

  /**
   * 注销快捷键
   */
  unregister(actionId: string): void {
    const registration = this.registrations.get(actionId);
    if (registration) {
      globalShortcut.unregister(registration.hotkey);
      this.registrations.delete(actionId);
      console.log(`Unregistered hotkey for action: ${actionId}`);
    }
  }

  /**
   * 检查快捷键冲突
   */
  checkConflict(hotkey: string): string[] {
    const conflicts: string[] = [];

    // 检查是否已被当前应用注册
    for (const [actionId, registration] of this.registrations) {
      if (registration.hotkey === hotkey) {
        conflicts.push(`Application: ${actionId}`);
      }
    }

    // 检查是否已被系统或其他应用注册
    // 注意:Electron 没有提供直接的API检查系统快捷键冲突
    // 我们通过尝试注册来检测
    if (!globalShortcut.isRegistered(hotkey)) {
      const testRegister = globalShortcut.register(hotkey, () => {});
      if (!testRegister) {
        conflicts.push('System or other application');
      } else {
        globalShortcut.unregister(hotkey);
      }
    } else {
      // 已被注册(可能是系统或其他应用)
      let isOurs = false;
      for (const registration of this.registrations.values()) {
        if (registration.hotkey === hotkey) {
          isOurs = true;
          break;
        }
      }
      if (!isOurs) {
        conflicts.push('System or other application');
      }
    }

    return conflicts;
  }

  /**
   * 注销所有快捷键
   */
  unregisterAll(): void {
    globalShortcut.unregisterAll();
    this.registrations.clear();
    console.log('Unregistered all hotkeys');
  }

  /**
   * 验证快捷键格式
   */
  private isValidHotkey(hotkey: string): boolean {
    // 基本格式验证
    const validModifiers = ['CommandOrControl', 'Command', 'Control', 'Ctrl', 'Alt', 'Option', 'Shift', 'Super', 'Meta'];
    const parts = hotkey.split('+').map(p => p.trim());

    if (parts.length === 0) {
      return false;
    }

    // 最后一个必须是按键
    const key = parts[parts.length - 1];
    if (validModifiers.includes(key)) {
      return false;
    }

    return true;
  }

  /**
   * 获取所有已注册的快捷键
   */
  getRegistrations(): HotkeyRegistration[] {
    return Array.from(this.registrations.values());
  }
}

// 导出单例
export const hotkeyService = new HotkeyService();
