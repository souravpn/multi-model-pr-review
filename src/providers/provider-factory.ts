import { IProvider } from '../types';
import { ClaudeProvider } from './claude-provider';
import { OpenAIProvider } from './openai-provider';
import { GeminiProvider } from './gemini-provider';

export class ProviderFactory {
  static create(
    providerName: string,
    apiKey: string,
    modelId: string
  ): IProvider {
    switch (providerName.toLowerCase()) {
      case 'claude':
        return new ClaudeProvider(apiKey, modelId);
      case 'openai':
        return new OpenAIProvider(apiKey, modelId);
      case 'gemini':
        return new GeminiProvider(apiKey, modelId);
      default:
        throw new Error(`Unknown provider: ${providerName}`);
    }
  }
}
