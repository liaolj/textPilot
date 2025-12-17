/**
 * 自定义 API 适配器 (兼容 OpenAI 格式)
 */

import fetch from 'node-fetch';
import type { ModelConfig } from '../../../src/types/models';

export interface CustomMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CustomRequest {
  model: string;
  messages: CustomMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface CustomResponse {
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    total_tokens: number;
  };
}

export class CustomAdapter {
  private config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  async process(systemPrompt: string, userPrompt: string): Promise<{ content: string; tokensUsed?: number }> {
    if (!this.config.baseUrl) {
      throw new Error('Custom API requires baseUrl');
    }

    const url = `${this.config.baseUrl}/chat/completions`;

    const messages: CustomMessage[] = [];

    if (systemPrompt.trim()) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }

    messages.push({
      role: 'user',
      content: userPrompt
    });

    const requestBody: CustomRequest = {
      model: this.config.modelName,
      messages,
      temperature: 0.7,
      max_tokens: 4000
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Custom API error: ${response.status} ${errorText}`);
    }

    const data = await response.json() as CustomResponse;

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from custom API');
    }

    return {
      content: data.choices[0].message.content,
      tokensUsed: data.usage?.total_tokens
    };
  }
}
