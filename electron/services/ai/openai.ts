/**
 * OpenAI 适配器
 */

import fetch from 'node-fetch';
import type { ModelConfig } from '../../../src/types/models';

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface OpenAIResponse {
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

export class OpenAIAdapter {
  private config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  async process(systemPrompt: string, userPrompt: string): Promise<{ content: string; tokensUsed?: number }> {
    const baseUrl = this.config.baseUrl || 'https://api.openai.com/v1';
    const url = `${baseUrl}/chat/completions`;

    const messages: OpenAIMessage[] = [];

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

    const requestBody: OpenAIRequest = {
      model: this.config.modelName,
      messages,
      temperature: 0.7,
      max_tokens: 4000
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json() as OpenAIResponse;

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from OpenAI');
    }

    return {
      content: data.choices[0].message.content,
      tokensUsed: data.usage?.total_tokens
    };
  }
}
