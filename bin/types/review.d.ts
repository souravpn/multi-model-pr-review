export interface ReviewFinding {
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    lineReference?: string;
}
export interface ReviewCategory {
    score: number;
    findings: ReviewFinding[];
    suggestions: string[];
}
export interface ModelReview {
    modelName: string;
    modelId: string;
    timestamp: Date;
    executionTime: number;
    codeQuality: ReviewCategory;
    security: ReviewCategory;
    performance: ReviewCategory;
    testCoverage: ReviewCategory;
    documentation: ReviewCategory;
    bestPractices: ReviewCategory;
    overallSummary: string;
    criticalIssues: ReviewFinding[];
    overallScore: number;
    error?: string;
}
export interface ConsolidatedReviewCategory {
    consensus: number;
    disagreements: Array<{
        model: string;
        score: number;
    }>;
    recommendation: string;
    synthesizedFindings: ReviewFinding[];
}
export interface ConsolidatedReport {
    executiveSummary: string;
    topPriorityActions: string[];
    categories: {
        codeQuality: ConsolidatedReviewCategory;
        security: ConsolidatedReviewCategory;
        performance: ConsolidatedReviewCategory;
        testCoverage: ConsolidatedReviewCategory;
        documentation: ConsolidatedReviewCategory;
        bestPractices: ConsolidatedReviewCategory;
    };
    modelAgreementMatrix: Record<string, Record<string, {
        scores: number[];
        consensus: number;
    }>>;
    timestamp: Date;
}
//# sourceMappingURL=review.d.ts.map