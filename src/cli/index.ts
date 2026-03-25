#!/usr/bin/env node
import { Command } from 'commander';
import { ReviewOptions } from '../types';
import { createDefaultOptions } from './options';
import { configCommand } from './commands/config';
import { reviewCommand } from './commands/review';

const program = new Command();

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
      await configCommand(options.verbose);
    } catch (error) {
      console.error(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
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
      const reviewOptions: ReviewOptions = createDefaultOptions();

      // Apply overrides
      if (options.url) reviewOptions.url = options.url;
      if (options.file) reviewOptions.file = options.file;
      if (options.output) reviewOptions.output = options.output;

      reviewOptions.claude.enabled = options.claude !== false;
      reviewOptions.openai.enabled = options.openai !== false;
      reviewOptions.gemini.enabled = options.gemini !== false;

      if (options.claudeModel) reviewOptions.claude.model = options.claudeModel;
      if (options.openaiModel) reviewOptions.openai.model = options.openaiModel;
      if (options.geminiModel) reviewOptions.gemini.model = options.geminiModel;

      reviewOptions.consolidate = options.consolidate !== false;
      reviewOptions.timeout = parseInt(options.timeout, 10);
      reviewOptions.verbose = options.verbose || false;

      await reviewCommand(reviewOptions);
    } catch (error) {
      console.error(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      process.exit(1);
    }
  });

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
