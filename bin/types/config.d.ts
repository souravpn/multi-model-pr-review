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
    claude: ProviderConfig & {
        model: string;
    };
    openai: ProviderConfig & {
        model: string;
    };
    gemini: ProviderConfig & {
        model: string;
    };
    consolidate: boolean;
    timeout: number;
    maxFileCharsPerModel: number;
    verbose: boolean;
}
export interface ModelId {
    claude: string;
    openai: string;
    gemini: string;
}
export declare const DEFAULT_MODELS: ModelId;
//# sourceMappingURL=config.d.ts.map