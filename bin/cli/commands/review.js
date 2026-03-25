"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewCommand = reviewCommand;
const utils_1 = require("../../utils");
const fetchers_1 = require("../../fetchers");
const reviewers_1 = require("../../reviewers");
const reporters_1 = require("../../reporters");
const providers_1 = require("../../providers");
async function reviewCommand(options) {
    const logger = new utils_1.Logger(options.verbose);
    const env = (0, utils_1.loadEnv)();
    // Validation
    if (!options.url && !options.file) {
        throw new Error('Either --url (GitHub PR) or --file (local diff) must be provided');
    }
    if (options.url && options.file) {
        throw new Error('Cannot use both --url and --file');
    }
    // Fetch PR data
    logger.info('Fetching PR data...');
    let fetcher;
    if (options.url) {
        if (!env.GITHUB_TOKEN) {
            throw new Error('GITHUB_TOKEN environment variable is required for --url');
        }
        fetcher = new fetchers_1.GitHubFetcher(options.url, env.GITHUB_TOKEN);
    }
    else if (options.file) {
        fetcher = new fetchers_1.LocalDiffFetcher(options.file);
    }
    else {
        throw new Error('Invalid input');
    }
    const prData = await fetcher.fetch();
    logger.info(`PR fetched: ${prData.title}`);
    // Build prompts
    logger.info('Building review prompts...');
    const prContext = reviewers_1.PromptBuilder.buildContextString(prData);
    const prDiff = reviewers_1.PromptBuilder.buildDiffString(prData, options.maxFileCharsPerModel);
    // Create providers
    const providers = [];
    const enabledProviders = [
        { name: 'claude', config: options.claude, required: env.ANTHROPIC_API_KEY },
        { name: 'openai', config: options.openai, required: env.OPENAI_API_KEY },
        { name: 'gemini', config: options.gemini, required: env.GEMINI_API_KEY },
    ];
    for (const { name, config, required } of enabledProviders) {
        if (config.enabled && required) {
            const provider = providers_1.ProviderFactory.create(name, required, config.model);
            providers.push(provider);
        }
        else if (config.enabled && !required) {
            logger.warn(`Skipping ${name}: API key not configured`);
        }
    }
    if (providers.length === 0) {
        throw new Error('No providers available. Check your API keys.');
    }
    logger.info(`Running reviews with: ${providers.map((p) => p.name).join(', ')}`);
    // Run reviews
    const orchestrator = new reviewers_1.ReviewOrchestrator(providers, prDiff, prContext, options.timeout);
    const reviews = await orchestrator.orchestrate();
    if (reviews.length === 0) {
        throw new Error('All reviews failed');
    }
    // Consolidate if needed
    let consolidated;
    if (options.consolidate && providers.length > 1 && env.ANTHROPIC_API_KEY) {
        logger.info('Consolidating reviews...');
        const consolidator = new reviewers_1.Consolidator(env.ANTHROPIC_API_KEY);
        consolidated = await consolidator.consolidate(reviews);
    }
    else if (reviews.length === 1) {
        const consolidator = new reviewers_1.Consolidator(env.ANTHROPIC_API_KEY || '');
        consolidated = await consolidator.consolidate(reviews);
    }
    else if (!options.consolidate && providers.length > 1) {
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
    }
    else {
        throw new Error('Cannot consolidate without Claude API key or with single provider');
    }
    // Generate report
    logger.info('Generating report...');
    const report = reporters_1.MarkdownReporter.generateReport(prData, reviews, consolidated);
    // Write output
    const outputPath = await (0, utils_1.writeFile)(options.output || null, report);
    reporters_1.ConsoleReporter.success(`Report generated: ${outputPath}`);
}
//# sourceMappingURL=review.js.map