/**
 * AI 处理引擎主入口
 */

import { ModelType, type ModelConfig, type AIProcessRequest, type AIProcessResponse } from '../../../src/types/models';
import { OpenAIAdapter } from './openai';
import { ClaudeAdapter } from './claude';
import { OllamaAdapter } from './ollama';
import { CustomAdapter } from './custom';
import { modelsService } from '../storage';

export class AIService {
  /**
   * 处理 AI 请求
   */
  async process(request: AIProcessRequest): Promise<AIProcessResponse> {
    try {
      // 获取模型配置
      const model = modelsService.get(request.modelId);

      if (!model) {
        return {
          content: '',
          modelUsed: request.modelId,
          error: `Model not found: ${request.modelId}`
        };
      }

      // 根据模型类型选择适配器
      const adapter = this.getAdapter(model);

      // 调用 AI 处理
      const systemPrompt = request.systemPrompt || '';
      const result = await adapter.process(systemPrompt, request.prompt);

      return {
        content: result.content,
        modelUsed: model.name,
        tokensUsed: result.tokensUsed
      };
    } catch (error) {
      console.error('AI processing error:', error);

      return {
        content: '',
        modelUsed: request.modelId,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 根据模型类型获取适配器
   */
  private getAdapter(model: ModelConfig): OpenAIAdapter | ClaudeAdapter | OllamaAdapter | CustomAdapter {
    switch (model.type) {
      case ModelType.OPENAI:
        return new OpenAIAdapter(model);
      case ModelType.CLAUDE:
        return new ClaudeAdapter(model);
      case ModelType.OLLAMA:
        return new OllamaAdapter(model);
      case ModelType.CUSTOM:
        return new CustomAdapter(model);
      default:
        throw new Error(`Unsupported model type: ${model.type}`);
    }
  }
}

// 导出单例
export const aiService = new AIService();
