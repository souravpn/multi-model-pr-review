import { ModelReview, ConsolidatedReport } from '../types';
export declare class Consolidator {
    private claudeProvider;
    constructor(claudeApiKey: string);
    consolidate(reviews: ModelReview[]): Promise<ConsolidatedReport>;
    private buildSynthesisPrompt;
    private singleReviewToReport;
    private buildConsolidatedReport;
    private buildAgreementMatrix;
}
//# sourceMappingURL=consolidator.d.ts.map