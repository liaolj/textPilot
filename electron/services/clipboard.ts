/**
 * 剪贴板服务
 */

import { clipboard } from 'electron';

/**
 * 剪贴板服务
 */
export class ClipboardService {
  /**
   * 读取剪贴板文本
   */
  read(): string {
    return clipboard.readText();
  }

  /**
   * 写入剪贴板文本
   */
  write(text: string): void {
    clipboard.writeText(text);
  }

  /**
   * 清空剪贴板
   */
  clear(): void {
    clipboard.clear();
  }

  /**
   * 检查剪贴板是否有文本内容
   */
  hasText(): boolean {
    return clipboard.has('text/plain');
  }
}

// 导出单例
export const clipboardService = new ClipboardService();
