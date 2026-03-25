"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderFactory = void 0;
const claude_provider_1 = require("./claude-provider");
const openai_provider_1 = require("./openai-provider");
const gemini_provider_1 = require("./gemini-provider");
class ProviderFactory {
    static create(providerName, apiKey, modelId) {
        switch (providerName.toLowerCase()) {
            case 'claude':
                return new claude_provider_1.ClaudeProvider(apiKey, modelId);
            case 'openai':
                return new openai_provider_1.OpenAIProvider(apiKey, modelId);
            case 'gemini':
                return new gemini_provider_1.GeminiProvider(apiKey, modelId);
            default:
                throw new Error(`Unknown provider: ${providerName}`);
        }
    }
}
exports.ProviderFactory = ProviderFactory;
//# sourceMappingURL=provider-factory.js.map