"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Consolidator = void 0;
const providers_1 = require("../providers");
class Consolidator {
    constructor(claudeApiKey) {
        this.claudeProvider = new providers_1.ClaudeProvider(claudeApiKey, 'claude-sonnet-4-6');
    }
    async consolidate(reviews) {
        if (reviews.length === 0) {
            throw new Error('No reviews to consolidate');
        }
        if (reviews.length === 1) {
            // Single review - just wrap it
            return this.singleReviewToReport(reviews[0]);
        }
        // Multiple reviews - use Claude Sonnet to synthesize
        const synthesisPrompt = this.buildSynthesisPrompt(reviews);
        const synthesisResponse = await this.claudeProvider.review(synthesisPrompt, 'Consolidate code review findings');
        // Parse the consolidated data from Claude's response
        return this.buildConsolidatedReport(reviews, synthesisResponse);
    }
    buildSynthesisPrompt(reviews) {
        const reviewsJson = JSON.stringify(reviews, null, 2);
        return `You are a master code reviewer. I have collected code reviews from ${reviews.length} AI models.

Your task is to analyze these reviews and create a consolidated perspective. Consider:
1. Where models agree (consensus)
2. Where models disagree (outliers)
3. Overall patterns and priorities

Here are the reviews:

${reviewsJson}

Respond with a JSON object containing:
{
  "executiveSummary": "3-5 sentence summary",
  "topPriorityActions": ["action1", "action2", "action3"],
  "categoryAnalysis": {
    "codeQuality": {
      "consensus": <1-5>,
      "recommendation": "...",
      "disagreements": [{"model": "...", "reasoning": "..."}]
    },
    // ... repeat for security, performance, testCoverage, documentation, bestPractices
  }
}`;
    }
    singleReviewToReport(review) {
        const createCategory = (category) => ({
            consensus: category.score || 3,
            disagreements: [],
            recommendation: category.suggestions?.[0] || 'See individual review',
            synthesizedFindings: category.findings || [],
        });
        return {
            executiveSummary: review.overallSummary,
            topPriorityActions: review.criticalIssues.map((i) => i.description),
            categories: {
                codeQuality: createCategory(review.codeQuality),
                security: createCategory(review.security),
                performance: createCategory(review.performance),
                testCoverage: createCategory(review.testCoverage),
                documentation: createCategory(review.documentation),
                bestPractices: createCategory(review.bestPractices),
            },
            modelAgreementMatrix: this.buildAgreementMatrix([review]),
            timestamp: new Date(),
        };
    }
    buildConsolidatedReport(reviews, synthesisResponse) {
        const createCategory = (categoryName) => {
            const scores = reviews
                .map((r) => r[categoryName]?.score)
                .filter((s) => typeof s === 'number');
            const consensus = scores.length > 0
                ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                : 3;
            const disagreements = reviews
                .map((r) => ({
                model: r.modelName,
                score: r[categoryName]?.score || 0,
            }))
                .filter((d) => Math.abs(d.score - consensus) > 1);
            return {
                consensus,
                disagreements,
                recommendation: synthesisResponse[categoryName]?.suggestions?.[0] ||
                    'Review findings',
                synthesizedFindings: synthesisResponse[categoryName]
                    ?.findings || [],
            };
        };
        return {
            executiveSummary: synthesisResponse.overallSummary,
            topPriorityActions: synthesisResponse.criticalIssues.map((i) => i.description),
            categories: {
                codeQuality: createCategory('codeQuality'),
                security: createCategory('security'),
                performance: createCategory('performance'),
                testCoverage: createCategory('testCoverage'),
                documentation: createCategory('documentation'),
                bestPractices: createCategory('bestPractices'),
            },
            modelAgreementMatrix: this.buildAgreementMatrix(reviews),
            timestamp: new Date(),
        };
    }
    buildAgreementMatrix(reviews) {
        const categories = [
            'codeQuality',
            'security',
            'performance',
            'testCoverage',
            'documentation',
            'bestPractices',
        ];
        const matrix = {};
        for (const category of categories) {
            matrix[category] = {};
            const scores = reviews.map((r) => r[category]?.score || 0);
            const consensus = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            reviews.forEach((review, idx) => {
                matrix[category][review.modelName] = {
                    scores: [scores[idx]],
                    consensus,
                };
            });
        }
        return matrix;
    }
}
exports.Consolidator = Consolidator;
//# sourceMappingURL=consolidator.js.map