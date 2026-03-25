#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const options_1 = require("./options");
const config_1 = require("./commands/config");
const review_1 = require("./commands/review");
const program = new commander_1.Command();
program
    .name('multi-model-pr-review')
    .description('Review pull requests using Claude, GPT, and Gemini simultaneously')
    .version('1.0.0');
// Config command
program
    .command('config')
    .description('Configuration management')
    .command('validate')
    .description('Validate API key configuration')
    .option('--verbose', 'Verbose output')
    .action(async (options) => {
    try {
        await (0, config_1.configCommand)(options.verbose);
    }
    catch (error) {
        console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
});
// Review command
program
    .command('review')
    .description('Review a pull request')
    .option('--url <url>', 'GitHub PR URL')
    .option('--file <path>', 'Local diff file path')
    .option('--output <path>', 'Output report file (default: stdout)')
    .option('--claude-model <model>', 'Claude model ID')
    .option('--openai-model <model>', 'OpenAI model ID')
    .option('--gemini-model <model>', 'Gemini model ID')
    .option('--no-claude', 'Disable Claude provider')
    .option('--no-openai', 'Disable OpenAI provider')
    .option('--no-gemini', 'Disable Gemini provider')
    .option('--no-consolidate', 'Skip consolidation step')
    .option('--timeout <seconds>', 'Per-model timeout in seconds', '120')
    .option('--verbose', 'Verbose output')
    .action(async (options) => {
    try {
        const reviewOptions = (0, options_1.createDefaultOptions)();
        // Apply overrides
        if (options.url)
            reviewOptions.url = options.url;
        if (options.file)
            reviewOptions.file = options.file;
        if (options.output)
            reviewOptions.output = options.output;
        reviewOptions.claude.enabled = options.claude !== false;
        reviewOptions.openai.enabled = options.openai !== false;
        reviewOptions.gemini.enabled = options.gemini !== false;
        if (options.claudeModel)
            reviewOptions.claude.model = options.claudeModel;
        if (options.openaiModel)
            reviewOptions.openai.model = options.openaiModel;
        if (options.geminiModel)
            reviewOptions.gemini.model = options.geminiModel;
        reviewOptions.consolidate = options.consolidate !== false;
        reviewOptions.timeout = parseInt(options.timeout, 10);
        reviewOptions.verbose = options.verbose || false;
        await (0, review_1.reviewCommand)(reviewOptions);
    }
    catch (error) {
        console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
});
program.parse(process.argv);
// Show help if no command provided
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
//# sourceMappingURL=index.js.map