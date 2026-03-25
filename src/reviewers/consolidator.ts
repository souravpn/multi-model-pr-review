import { ModelReview, ConsolidatedReport, ConsolidatedReviewCategory } from '../types';
import { ClaudeProvider } from '../providers';

export class Consolidator {
  private claudeProvider: ClaudeProvider;

  constructor(claudeApiKey: string) {
    this.claudeProvider = new ClaudeProvider(
      claudeApiKey,
      'claude-sonnet-4-6'
    );
  }

  async consolidate(reviews: ModelReview[]): Promise<ConsolidatedReport> {
    if (reviews.length === 0) {
      throw new Error('No reviews to consolidate');
    }

    if (reviews.length === 1) {
      // Single review - just wrap it
      return this.singleReviewToReport(reviews[0]);
    }

    // Multiple reviews - use Claude Sonnet to synthesize
    const synthesisPrompt = this.buildSynthesisPrompt(reviews);

    const synthesisResponse = await this.claudeProvider.review(
      synthesisPrompt,
      'Consolidate code review findings'
    );

    // Parse the consolidated data from Claude's response
    return this.buildConsolidatedReport(reviews, synthesisResponse);
  }

  private buildSynthesisPrompt(reviews: ModelReview[]): string {
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

  private singleReviewToReport(review: ModelReview): ConsolidatedReport {
    const createCategory = (
      category: any
    ): ConsolidatedReviewCategory => ({
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

  private buildConsolidatedReport(
    reviews: ModelReview[],
    synthesisResponse: ModelReview
  ): ConsolidatedReport {
    const createCategory = (categoryName: string): ConsolidatedReviewCategory => {
      const scores = reviews
        .map((r) => (r as any)[categoryName]?.score)
        .filter((s) => typeof s === 'number');

      const consensus =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 3;

      const disagreements = reviews
        .map((r) => ({
          model: r.modelName,
          score: (r as any)[categoryName]?.score || 0,
        }))
        .filter((d) => Math.abs(d.score - consensus) > 1);

      return {
        consensus,
        disagreements,
        recommendation:
          (synthesisResponse as any)[categoryName]?.suggestions?.[0] ||
          'Review findings',
        synthesizedFindings: (synthesisResponse as any)[categoryName]
          ?.findings || [],
      };
    };

    return {
      executiveSummary: synthesisResponse.overallSummary,
      topPriorityActions: synthesisResponse.criticalIssues.map(
        (i) => i.description
      ),
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

  private buildAgreementMatrix(
    reviews: ModelReview[]
  ): Record<string, Record<string, { scores: number[]; consensus: number }>> {
    const categories = [
      'codeQuality',
      'security',
      'performance',
      'testCoverage',
      'documentation',
      'bestPractices',
    ];
    const matrix: Record<
      string,
      Record<string, { scores: number[]; consensus: number }>
    > = {};

    for (const category of categories) {
      matrix[category] = {};
      const scores = reviews.map((r) => (r as any)[category]?.score || 0);
      const consensus = Math.round(
        scores.reduce((a, b) => a + b, 0) / scores.length
      );

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
