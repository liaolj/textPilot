/**
 * Ollama 适配器 (本地模型)
 */

import fetch from 'node-fetch';
import type { ModelConfig } from '../../../src/types/models';

export interface OllamaRequest {
  model: string;
  prompt: string;
  system?: string;
  stream?: boolean;
}

export interface OllamaResponse {
  response: string;
  done: boolean;
}

export class OllamaAdapter {
  private config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  async process(systemPrompt: string, userPrompt: string): Promise<{ content: string; tokensUsed?: number }> {
    const baseUrl = this.config.baseUrl || 'http://localhost:11434';
    const url = `${baseUrl}/api/generate`;

    const requestBody: OllamaRequest = {
      model: this.config.modelName,
      prompt: userPrompt,
      stream: false
    };

    if (systemPrompt.trim()) {
      requestBody.system = systemPrompt;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status} ${errorText}`);
    }

    const data = await response.json() as OllamaResponse;

    if (!data.response) {
      throw new Error('No response from Ollama');
    }

    return {
      content: data.response,
      tokensUsed: undefined // Ollama 不返回 token 使用量
    };
  }
}
