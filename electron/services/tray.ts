/**
 * 系统托盘服务
 */

import { app, Menu, Tray, BrowserWindow, nativeImage } from 'electron';
import path from 'path';

export class TrayService {
  private tray: Tray | null = null;
  private mainWindow: BrowserWindow | null = null;

  /**
   * 设置主窗口引用
   */
  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  /**
   * 创建系统托盘
   */
  create(): void {
    // 创建托盘图标
    const iconPath = this.getIconPath();
    const icon = nativeImage.createFromPath(iconPath);

    // 创建 Tray 实例
    this.tray = new Tray(icon);

    // 设置工具提示
    this.tray.setToolTip('TextPilot - AI 驾驭你的文字');

    // 左键点击 - 显示/隐藏主窗口
    this.tray.on('click', () => {
      this.toggleMainWindow();
    });

    // 创建右键菜单
    this.updateContextMenu();
  }

  /**
   * 更新托盘菜单
   */
  updateContextMenu(quickActions?: Array<{ id: string; name: string; hotkey?: string }>): void {
    if (!this.tray) return;

    const menuTemplate: Electron.MenuItemConstructorOptions[] = [
      {
        label: '打开 TextPilot',
        click: () => {
          this.showMainWindow();
        }
      },
      { type: 'separator' }
    ];

    // 添加快捷动作
    if (quickActions && quickActions.length > 0) {
      menuTemplate.push({
        label: '快捷动作',
        submenu: quickActions.map(action => ({
          label: action.hotkey ? `${action.name} (${action.hotkey})` : action.name,
          click: () => {
            // 触发动作
            if (this.mainWindow) {
              this.mainWindow.webContents.send('execute-action', action.id);
            }
          }
        }))
      });
      menuTemplate.push({ type: 'separator' });
    }

    menuTemplate.push(
      {
        label: '设置',
        click: () => {
          if (this.mainWindow) {
            this.mainWindow.webContents.send('open-settings');
            this.showMainWindow();
          }
        }
      },
      {
        label: '历史记录',
        click: () => {
          if (this.mainWindow) {
            this.mainWindow.webContents.send('open-history');
            this.showMainWindow();
          }
        }
      },
      { type: 'separator' },
      {
        label: '退出',
        click: () => {
          app.quit();
        }
      }
    );

    const contextMenu = Menu.buildFromTemplate(menuTemplate);
    this.tray.setContextMenu(contextMenu);
  }

  /**
   * 显示主窗口
   */
  private showMainWindow(): void {
    if (this.mainWindow) {
      if (!this.mainWindow.isVisible()) {
        this.mainWindow.show();
      }
      this.mainWindow.focus();
    }
  }

  /**
   * 切换主窗口显示/隐藏
   */
  private toggleMainWindow(): void {
    if (this.mainWindow) {
      if (this.mainWindow.isVisible()) {
        this.mainWindow.hide();
      } else {
        this.showMainWindow();
      }
    }
  }

  /**
   * 获取托盘图标路径
   */
  private getIconPath(): string {
    // 根据平台选择合适的图标
    const iconName = process.platform === 'win32' ? 'tray-icon.png' : 'tray-icon.png';
    return path.join(app.getAppPath(), 'resources', iconName);
  }

  /**
   * 销毁托盘
   */
  destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}

// 导出单例
export const trayService = new TrayService();
