import { loadEnv, validateApiKeys, Logger } from '../../utils';

export async function configCommand(verbose: boolean = false): Promise<void> {
  const logger = new Logger(verbose);
  const env = loadEnv();

  logger.info('Validating configuration...');

  const providers = ['claude', 'openai', 'gemini'];
  const validation = validateApiKeys(env, providers);

  if (!validation.valid) {
    logger.warn(
      `Missing API keys for: ${validation.missing.join(', ')}`
    );
    console.error(
      `\n⚠️  Missing Configuration:\n${validation.missing.map((key) => `  - ${key}_API_KEY`).join('\n')}`
    );
    process.exit(1);
  }

  logger.info('✓ All required API keys detected');
  console.error('\n✓ Configuration is valid:');
  console.error(`  - ANTHROPIC_API_KEY: ${env.ANTHROPIC_API_KEY?.substring(0, 5)}...`);
  console.error(`  - OPENAI_API_KEY: ${env.OPENAI_API_KEY?.substring(0, 5)}...`);
  console.error(`  - GEMINI_API_KEY: ${env.GEMINI_API_KEY?.substring(0, 5)}...`);

  if (env.GITHUB_TOKEN) {
    console.error(`  - GITHUB_TOKEN: ${env.GITHUB_TOKEN.substring(0, 5)}...`);
  } else {
    console.error(`  - GITHUB_TOKEN: not set (required for --url)`);
  }
}
