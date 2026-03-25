import { ModelReview } from '../types';
import { BaseProvider } from './base-provider';
export declare class GeminiProvider extends BaseProvider {
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
//# sourceMappingURL=gemini-provider.d.ts.map