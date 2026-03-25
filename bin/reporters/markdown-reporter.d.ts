import { ModelReview, ConsolidatedReport, PRData } from '../types';
export declare class MarkdownReporter {
    static generateReport(prData: PRData, reviews: ModelReview[], consolidated: ConsolidatedReport): string;
    private static generateHeader;
    private static generateExecutiveSummary;
    private static generateTopPriorities;
    private static generateIndividualReviews;
    private static generateReviewSection;
    private static generateConsolidatedAnalysis;
    private static generateAgreementMatrix;
    private static scoreToStars;
}
//# sourceMappingURL=markdown-reporter.d.ts.map