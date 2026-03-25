"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptBuilder = void 0;
class PromptBuilder {
    static buildContextString(prData) {
        return `
Title: ${prData.title}
Author: ${prData.author}
Repository: ${prData.repository}
Branch: ${prData.baseRef} <- ${prData.headRef}
URL: ${prData.url}

Description:
${prData.description || 'No description provided'}

Statistics:
- Files changed: ${prData.stats.filesChanged}
- Additions: ${prData.stats.additions}
- Deletions: ${prData.stats.deletions}

Commits: ${prData.commits.length}
${prData.commits.map((c) => `  - ${c.message} (${c.author})`).join('\n')}
    `.trim();
    }
    static buildDiffString(prData, maxCharsPerFile = 2000) {
        return prData.files
            .map((file) => {
            const truncatedPatch = file.patch.length > maxCharsPerFile
                ? file.patch.substring(0, maxCharsPerFile) + '\n... (truncated)'
                : file.patch;
            return `File: ${file.filename} (${file.language || 'unknown'})
+${file.additions} -${file.deletions}

${truncatedPatch}`;
        })
            .join('\n\n---\n\n');
    }
}
exports.PromptBuilder = PromptBuilder;
//# sourceMappingURL=prompt-builder.js.map