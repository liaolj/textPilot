/**
 * API Key 加密工具
 * 使用 AES-256-GCM 加密
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { machineIdSync } from 'node-machine-id';

const ALGORITHM = 'aes-256-gcm';
const APP_SECRET = 'textpilot-secret-key-v1';

// 生成加密密钥 (基于机器ID + 应用密钥)
function getEncryptionKey(): Buffer {
  const machineId = machineIdSync();
  const combined = `${machineId}-${APP_SECRET}`;
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(combined).digest();
}

/**
 * 加密文本
 */
export function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // 返回格式: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * 解密文本
 */
export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey();
  const parts = encryptedText.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * 安全地加密模型配置中的 API Key
 */
export function encryptModelConfig(config: any): any {
  if (config.apiKey) {
    return {
      ...config,
      apiKey: encrypt(config.apiKey)
    };
  }
  return config;
}

/**
 * 安全地解密模型配置中的 API Key
 */
export function decryptModelConfig(config: any): any {
  if (config.apiKey) {
    try {
      return {
        ...config,
        apiKey: decrypt(config.apiKey)
      };
    } catch (error) {
      // 如果解密失败,可能是未加密的 Key,直接返回
      return config;
    }
  }
  return config;
}
