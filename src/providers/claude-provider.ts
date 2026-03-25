import Anthropic from '@anthropic-ai/sdk';
import { ModelReview } from '../types';
import { BaseProvider } from './base-provider';

export class ClaudeProvider extends BaseProvider {
  name = 'Claude';
  modelId: string;
  private client: Anthropic;

  constructor(apiKey: string, modelId: string = 'claude-opus-4-6') {
    super();
    this.modelId = modelId;
    this.client = new Anthropic({ apiKey });
  }

  async review(prDiff: string, prContext: string): Promise<ModelReview> {
    const startTime = Date.now();

    try {
      const prompt = this.buildPrompt(prDiff, prContext);

      const message = await this.withTimeout(
        this.client.messages.create({
          model: this.modelId,
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
        120000
      );

      const responseText =
        message.content[0].type === 'text' ? message.content[0].text : '';
      const reviewData = this.parseJsonResponse(responseText);

      return this.buildReview(reviewData, Date.now() - startTime);
    } catch (error) {
      return this.buildErrorReview(
        error instanceof Error ? error.message : 'Unknown error',
        Date.now() - startTime
      );
    }
  }

  private buildPrompt(prDiff: string, prContext: string): string {
    return `You are an expert code reviewer. Review the following pull request and provide structured feedback.

PR CONTEXT:
${prContext}

PR DIFF (truncated for token limits):
${prDiff.substring(0, 4000)}

Please provide your review in the following JSON format:
{
  "codeQuality": {
    "score": <1-5>,
    "findings": [{"category": "...", "severity": "low|medium|high|critical", "description": "..."}],
    "suggestions": ["..."]
  },
  "security": {
    "score": <1-5>,
    "findings": [...],
    "suggestions": ["..."]
  },
  "performance": {
    "score": <1-5>,
    "findings": [...],
    "suggestions": ["..."]
  },
  "testCoverage": {
    "score": <1-5>,
    "findings": [...],
    "suggestions": ["..."]
  },
  "documentation": {
    "score": <1-5>,
    "findings": [...],
    "suggestions": ["..."]
  },
  "bestPractices": {
    "score": <1-5>,
    "findings": [...],
    "suggestions": ["..."]
  },
  "overallSummary": "...",
  "criticalIssues": [...]
}`;
  }

  private buildReview(data: any, executionTime: number): ModelReview {
    const defaultCategory = {
      score: 3,
      findings: [],
      suggestions: [],
    };

    return {
      modelName: this.name,
      modelId: this.modelId,
      timestamp: new Date(),
      executionTime,
      codeQuality: data.codeQuality || defaultCategory,
      security: data.security || defaultCategory,
      performance: data.performance || defaultCategory,
      testCoverage: data.testCoverage || defaultCategory,
      documentation: data.documentation || defaultCategory,
      bestPractices: data.bestPractices || defaultCategory,
      overallSummary: data.overallSummary || 'Review completed',
      criticalIssues: data.criticalIssues || [],
      overallScore: this.calculateOverallScore(data),
    };
  }

  private buildErrorReview(errorMessage: string, executionTime: number): ModelReview {
    return {
      modelName: this.name,
      modelId: this.modelId,
      timestamp: new Date(),
      executionTime,
      codeQuality: { score: 0, findings: [], suggestions: [] },
      security: { score: 0, findings: [], suggestions: [] },
      performance: { score: 0, findings: [], suggestions: [] },
      testCoverage: { score: 0, findings: [], suggestions: [] },
      documentation: { score: 0, findings: [], suggestions: [] },
      bestPractices: { score: 0, findings: [], suggestions: [] },
      overallSummary: '',
      criticalIssues: [],
      overallScore: 0,
      error: errorMessage,
    };
  }

  private calculateOverallScore(data: any): number {
    const scores = [
      data.codeQuality?.score,
      data.security?.score,
      data.performance?.score,
      data.testCoverage?.score,
      data.documentation?.score,
      data.bestPractices?.score,
    ].filter((s) => typeof s === 'number');

    return scores.length > 0
      ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
      : 0;
  }
}
