import { ModelReview } from '../types';
import { BaseProvider } from './base-provider';
export declare class OpenAIProvider extends BaseProvider {
    name: string;
    modelId: string;
    private client;
    constructor(apiKey: string, modelId?: string);
    review(prDiff: string, prContext: string): Promise<ModelReview>;
    private buildPrompt;
    private buildReview;
    private buildErrorReview;
    private calculateOverallScore;
}
//# sourceMappingURL=openai-provider.d.ts.map