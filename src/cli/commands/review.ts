import { ReviewOptions, PRData } from '../../types';
import {
  loadEnv,
  validateApiKeys,
  Logger,
  writeFile,
  readFile,
} from '../../utils';
import {
  GitHubFetcher,
  LocalDiffFetcher,
  IFetcher,
} from '../../fetchers';
import {
  PromptBuilder,
  ReviewOrchestrator,
  Consolidator,
} from '../../reviewers';
import { MarkdownReporter, ConsoleReporter } from '../../reporters';
import { ProviderFactory } from '../../providers';
import { IProvider } from '../../types';

export async function reviewCommand(options: ReviewOptions): Promise<void> {
  const logger = new Logger(options.verbose);
  const env = loadEnv();

  // Validation
  if (!options.url && !options.file) {
    throw new Error(
      'Either --url (GitHub PR) or --file (local diff) must be provided'
    );
  }

  if (options.url && options.file) {
    throw new Error('Cannot use both --url and --file');
  }

  // Fetch PR data
  logger.info('Fetching PR data...');
  let fetcher: IFetcher;

  if (options.url) {
    if (!env.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN environment variable is required for --url');
    }
    fetcher = new GitHubFetcher(options.url, env.GITHUB_TOKEN);
  } else if (options.file) {
    fetcher = new LocalDiffFetcher(options.file);
  } else {
    throw new Error('Invalid input');
  }

  const prData = await fetcher.fetch();
  logger.info(`PR fetched: ${prData.title}`);

  // Build prompts
  logger.info('Building review prompts...');
  const prContext = PromptBuilder.buildContextString(prData);
  const prDiff = PromptBuilder.buildDiffString(
    prData,
    options.maxFileCharsPerModel
  );

  // Create providers
  const providers: IProvider[] = [];
  const enabledProviders = [
    { name: 'claude', config: options.claude, required: env.ANTHROPIC_API_KEY },
    { name: 'openai', config: options.openai, required: env.OPENAI_API_KEY },
    { name: 'gemini', config: options.gemini, required: env.GEMINI_API_KEY },
  ];

  for (const { name, config, required } of enabledProviders) {
    if (config.enabled && required) {
      const provider = ProviderFactory.create(name, required, config.model);
      providers.push(provider);
    } else if (config.enabled && !required) {
      logger.warn(
        `Skipping ${name}: API key not configured`
      );
    }
  }

  if (providers.length === 0) {
    throw new Error('No providers available. Check your API keys.');
  }

  logger.info(`Running reviews with: ${providers.map((p) => p.name).join(', ')}`);

  // Run reviews
  const orchestrator = new ReviewOrchestrator(
    providers,
    prDiff,
    prContext,
    options.timeout
  );
  const reviews = await orchestrator.orchestrate();

  if (reviews.length === 0) {
    throw new Error('All reviews failed');
  }

  // Consolidate if needed
  let consolidated;
  if (options.consolidate && providers.length > 1 && env.ANTHROPIC_API_KEY) {
    logger.info('Consolidating reviews...');
    const consolidator = new Consolidator(env.ANTHROPIC_API_KEY);
    consolidated = await consolidator.consolidate(reviews);
  } else if (reviews.length === 1) {
    const consolidator = new Consolidator(env.ANTHROPIC_API_KEY || '');
    consolidated = await consolidator.consolidate(reviews);
  } else if (!options.consolidate && providers.length > 1) {
    // Multiple providers without consolidation - generate side-by-side report
    logger.info('Generating side-by-side report (consolidation disabled)...');
    // Create a pseudo-consolidated view that wraps individual reviews
    consolidated = {
      executiveSummary: `Side-by-side review from ${reviews.length} models (consolidation disabled)`,
      topPriorityActions: [],
      categories: {
        codeQuality: { consensus: 3, disagreements: [], recommendation: 'See individual reviews', synthesizedFindings: [] },
        security: { consensus: 3, disagreements: [], recommendation: 'See individual reviews', synthesizedFindings: [] },
        performance: { consensus: 3, disagreements: [], recommendation: 'See individual reviews', synthesizedFindings: [] },
        testCoverage: { consensus: 3, disagreements: [], recommendation: 'See individual reviews', synthesizedFindings: [] },
        documentation: { consensus: 3, disagreements: [], recommendation: 'See individual reviews', synthesizedFindings: [] },
        bestPractices: { consensus: 3, disagreements: [], recommendation: 'See individual reviews', synthesizedFindings: [] },
      },
      modelAgreementMatrix: {},
      timestamp: new Date(),
    };
  } else {
    throw new Error(
      'Cannot consolidate without Claude API key or with single provider'
    );
  }

  // Generate report
  logger.info('Generating report...');
  const report = MarkdownReporter.generateReport(prData, reviews, consolidated);

  // Write output
  const outputPath = await writeFile(options.output || null, report);
  ConsoleReporter.success(`Report generated: ${outputPath}`);
}
