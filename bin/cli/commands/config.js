"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configCommand = configCommand;
const utils_1 = require("../../utils");
async function configCommand(verbose = false) {
    const logger = new utils_1.Logger(verbose);
    const env = (0, utils_1.loadEnv)();
    logger.info('Validating configuration...');
    const providers = ['claude', 'openai', 'gemini'];
    const validation = (0, utils_1.validateApiKeys)(env, providers);
    if (!validation.valid) {
        logger.warn(`Missing API keys for: ${validation.missing.join(', ')}`);
        console.error(`\n⚠️  Missing Configuration:\n${validation.missing.map((key) => `  - ${key}_API_KEY`).join('\n')}`);
        process.exit(1);
    }
    logger.info('✓ All required API keys detected');
    console.error('\n✓ Configuration is valid:');
    console.error(`  - ANTHROPIC_API_KEY: ${env.ANTHROPIC_API_KEY?.substring(0, 5)}...`);
    console.error(`  - OPENAI_API_KEY: ${env.OPENAI_API_KEY?.substring(0, 5)}...`);
    console.error(`  - GEMINI_API_KEY: ${env.GEMINI_API_KEY?.substring(0, 5)}...`);
    if (env.GITHUB_TOKEN) {
        console.error(`  - GITHUB_TOKEN: ${env.GITHUB_TOKEN.substring(0, 5)}...`);
    }
    else {
        console.error(`  - GITHUB_TOKEN: not set (required for --url)`);
    }
}
//# sourceMappingURL=config.js.map