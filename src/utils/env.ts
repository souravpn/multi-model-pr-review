import * as dotenv from 'dotenv';

export interface EnvVars {
  ANTHROPIC_API_KEY?: string;
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
  GITHUB_TOKEN?: string;
}

export function loadEnv(): EnvVars {
  // Load from .env file if it exists
  dotenv.config();

  return {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  };
}

export function validateApiKeys(keys: EnvVars, providers: string[]): {
  valid: boolean;
  missing: string[];
} {
  const keyMap: Record<string, string | undefined> = {
    claude: keys.ANTHROPIC_API_KEY,
    openai: keys.OPENAI_API_KEY,
    gemini: keys.GEMINI_API_KEY,
  };

  const missing: string[] = [];
  providers.forEach((provider) => {
    if (!keyMap[provider]) {
      missing.push(provider.toUpperCase());
    }
  });

  return {
    valid: missing.length === 0,
    missing,
  };
}

export function getApiKey(provider: string): string | undefined {
  const keys = loadEnv();
  switch (provider) {
    case 'claude':
      return keys.ANTHROPIC_API_KEY;
    case 'openai':
      return keys.OPENAI_API_KEY;
    case 'gemini':
      return keys.GEMINI_API_KEY;
    default:
      return undefined;
  }
}
