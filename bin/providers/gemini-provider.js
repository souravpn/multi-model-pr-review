"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
const generative_ai_1 = require("@google/generative-ai");
const base_provider_1 = require("./base-provider");
class GeminiProvider extends base_provider_1.BaseProvider {
    constructor(apiKey, modelId = 'gemini-2.0-flash') {
        super();
        this.name = 'Gemini';
        this.modelId = modelId;
        this.client = new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    async review(prDiff, prContext) {
        const startTime = Date.now();
        try {
            const model = this.client.getGenerativeModel({ model: this.modelId });
            const prompt = this.buildPrompt(prDiff, prContext);
            const result = await this.withTimeout(model.generateContent(prompt), 120000);
            const responseText = result.response.text();
            const reviewData = this.parseJsonResponse(responseText);
            return this.buildReview(reviewData, Date.now() - startTime);
        }
        catch (error) {
            return this.buildErrorReview(error instanceof Error ? error.message : 'Unknown error', Date.now() - startTime);
        }
    }
    buildPrompt(prDiff, prContext) {
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
    buildReview(data, executionTime) {
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
    buildErrorReview(errorMessage, executionTime) {
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
    calculateOverallScore(data) {
        const scores = [
            data.codeQuality?.score,
            data.security?.score,
            data.performance?.score,
            data.testCoverage?.score,
            data.documentation?.score,
            data.bestPractices?.score,
        ].filter((s) => typeof s === 'number');
        return scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;
    }
}
exports.GeminiProvider = GeminiProvider;
//# sourceMappingURL=gemini-provider.js.map