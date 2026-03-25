import { ModelReview, IProvider } from '../types';
import ora from 'ora';

export class ReviewOrchestrator {
  private providers: IProvider[];
  private prDiff: string;
  private prContext: string;
  private timeout: number;

  constructor(
    providers: IProvider[],
    prDiff: string,
    prContext: string,
    timeoutSeconds: number = 120
  ) {
    this.providers = providers;
    this.prDiff = prDiff;
    this.prContext = prContext;
    this.timeout = timeoutSeconds * 1000;
  }

  async orchestrate(): Promise<ModelReview[]> {
    const spinner = ora(
      `Running reviews with ${this.providers.length} model(s)...`
    ).start();

    const reviewPromises = this.providers.map((provider) =>
      provider
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
          } as ModelReview;
        })
    );

    const results = await Promise.allSettled(reviewPromises);
    spinner.succeed(`All reviews completed`);

    return results
      .map((result) => (result.status === 'fulfilled' ? result.value : null))
      .filter((review): review is ModelReview => review !== null);
  }
}
