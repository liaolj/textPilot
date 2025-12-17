/**
 * Claude 适配器
 */

import fetch from 'node-fetch';
import type { ModelConfig } from '../../../src/types/models';

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeRequest {
  model: string;
  messages: ClaudeMessage[];
  system?: string;
  max_tokens: number;
  temperature?: number;
}

export interface ClaudeResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class ClaudeAdapter {
  private config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  async process(systemPrompt: string, userPrompt: string): Promise<{ content: string; tokensUsed?: number }> {
    const baseUrl = this.config.baseUrl || 'https://api.anthropic.com/v1';
    const url = `${baseUrl}/messages`;

    const requestBody: ClaudeRequest = {
      model: this.config.modelName,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7
    };

    if (systemPrompt.trim()) {
      requestBody.system = systemPrompt;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} ${errorText}`);
    }

    const data = await response.json() as ClaudeResponse;

    if (!data.content || data.content.length === 0) {
      throw new Error('No response from Claude');
    }

    const tokensUsed = data.usage
      ? data.usage.input_tokens + data.usage.output_tokens
      : undefined;

    return {
      content: data.content[0].text,
      tokensUsed
    };
  }
}
