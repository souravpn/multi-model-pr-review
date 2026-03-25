export type ProviderName = 'claude' | 'openai' | 'gemini';

export interface ProviderConfig {
  enabled: boolean;
  apiKey?: string;
  model?: string;
}

export interface ReviewOptions {
  url?: string;
  file?: string;
  output?: string;
  claude: ProviderConfig & { model: string };
  openai: ProviderConfig & { model: string };
  gemini: ProviderConfig & { model: string };
  consolidate: boolean;
  timeout: number; // seconds
  maxFileCharsPerModel: number;
  verbose: boolean;
}

export interface ModelId {
  claude: string;
  openai: string;
  gemini: string;
}

export const DEFAULT_MODELS: ModelId = {
  claude: 'claude-opus-4-6',
  openai: 'gpt-4-turbo',
  gemini: 'gemini-2.0-flash',
};
