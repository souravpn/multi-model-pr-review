export interface EnvVars {
    ANTHROPIC_API_KEY?: string;
    OPENAI_API_KEY?: string;
    GEMINI_API_KEY?: string;
    GITHUB_TOKEN?: string;
}
export declare function loadEnv(): EnvVars;
export declare function validateApiKeys(keys: EnvVars, providers: string[]): {
    valid: boolean;
    missing: string[];
};
export declare function getApiKey(provider: string): string | undefined;
//# sourceMappingURL=env.d.ts.map