import { ReviewOptions, DEFAULT_MODELS } from '../types';

export function createDefaultOptions(): ReviewOptions {
  return {
    claude: {
      enabled: true,
      model: DEFAULT_MODELS.claude,
    },
    openai: {
      enabled: true,
      model: DEFAULT_MODELS.openai,
    },
    gemini: {
      enabled: true,
      model: DEFAULT_MODELS.gemini,
    },
    consolidate: true,
    timeout: 120,
    maxFileCharsPerModel: 2000,
    verbose: false,
  };
}
