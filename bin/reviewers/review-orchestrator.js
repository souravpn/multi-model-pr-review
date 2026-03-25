"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewOrchestrator = void 0;
const ora_1 = __importDefault(require("ora"));
class ReviewOrchestrator {
    constructor(providers, prDiff, prContext, timeoutSeconds = 120) {
        this.providers = providers;
        this.prDiff = prDiff;
        this.prContext = prContext;
        this.timeout = timeoutSeconds * 1000;
    }
    async orchestrate() {
        const spinner = (0, ora_1.default)(`Running reviews with ${this.providers.length} model(s)...`).start();
        const reviewPromises = this.providers.map((provider) => provider
            .review(this.prDiff, this.prContext)
            .then((review) => {
            spinner.text = `${spinner.text.split('\n')[0]}\n✓ ${provider.name} completed (${review.executionTime}ms)`;
            return review;
        })
            .catch((error) => {
            spinner.text = `${spinner.text.split('\n')[0]}\n✗ ${provider.name} failed: ${error.message}`;
            return {
                modelName: provider.name,
                modelId: provider.modelId,
                timestamp: new Date(),
                executionTime: 0,
                codeQuality: { score: 0, findings: [], suggestions: [] },
                security: { score: 0, findings: [], suggestions: [] },
                performance: { score: 0, findings: [], suggestions: [] },
                testCoverage: { score: 0, findings: [], suggestions: [] },
                documentation: { score: 0, findings: [], suggestions: [] },
                bestPractices: { score: 0, findings: [], suggestions: [] },
                overallSummary: '',
                criticalIssues: [],
                overallScore: 0,
                error: error.message,
            };
        }));
        const results = await Promise.allSettled(reviewPromises);
        spinner.succeed(`All reviews completed`);
        return results
            .map((result) => (result.status === 'fulfilled' ? result.value : null))
            .filter((review) => review !== null);
    }
}
exports.ReviewOrchestrator = ReviewOrchestrator;
//# sourceMappingURL=review-orchestrator.js.map