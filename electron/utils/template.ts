/**
 * 模板变量替换工具
 */

import type { TemplateContext, PersonalInfo } from '../../src/types/models';

/**
 * 替换模板中的变量
 */
export function replaceTemplateVariables(template: string, context: TemplateContext): string {
  let result = template;

  // 替换基本变量
  result = result.replace(/\{\{clipboard\}\}/g, context.clipboard || '');
  result = result.replace(/\{\{date\}\}/g, context.date || '');
  result = result.replace(/\{\{time\}\}/g, context.time || '');

  // 替换用户信息变量
  if (context.user) {
    for (const [key, value] of Object.entries(context.user)) {
      if (value !== undefined) {
        const pattern = new RegExp(`\\{\\{user\\.${key}\\}\\}`, 'g');
        result = result.replace(pattern, value);
      }
    }
  }

  // 替换自定义变量
  for (const [key, value] of Object.entries(context)) {
    if (key !== 'clipboard' && key !== 'date' && key !== 'time' && key !== 'user') {
      const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(pattern, String(value));
    }
  }

  return result;
}

/**
 * 创建模板上下文
 */
export function createTemplateContext(
  clipboardContent: string,
  personalInfo: PersonalInfo
): TemplateContext {
  const now = new Date();

  return {
    clipboard: clipboardContent,
    date: now.toISOString().split('T')[0], // YYYY-MM-DD
    time: now.toTimeString().split(' ')[0].substring(0, 5), // HH:MM
    user: personalInfo
  };
}

/**
 * 提取模板中的变量列表
 */
export function extractTemplateVariables(template: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    variables.push(match[1]);
  }

  return [...new Set(variables)]; // 去重
}

/**
 * 验证模板变量是否有效
 */
export function validateTemplateVariables(template: string): { valid: boolean; errors: string[] } {
  const variables = extractTemplateVariables(template);
  const errors: string[] = [];

  const validPrefixes = ['clipboard', 'date', 'time', 'user.'];

  for (const variable of variables) {
    const isValid = validPrefixes.some(prefix =>
      variable === prefix.replace('.', '') || variable.startsWith(prefix)
    );

    if (!isValid) {
      errors.push(`Unknown variable: {{${variable}}}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
