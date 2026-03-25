"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseProvider = void 0;
class BaseProvider {
    parseJsonResponse(content) {
        // Extract JSON from content (handle markdown code blocks)
        const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) ||
            content.match(/({[\s\S]*})/);
        if (!jsonMatch) {
            throw new Error('No JSON found in response');
        }
        return JSON.parse(jsonMatch[1]);
    }
    async withTimeout(promise, timeoutMs) {
        return Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs)),
        ]);
    }
}
exports.BaseProvider = BaseProvider;
//# sourceMappingURL=base-provider.js.map