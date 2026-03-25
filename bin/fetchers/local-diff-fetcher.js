"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalDiffFetcher = void 0;
const fs = __importStar(require("fs"));
class LocalDiffFetcher {
    constructor(diffPath) {
        if (!fs.existsSync(diffPath)) {
            throw new Error(`Diff file not found: ${diffPath}`);
        }
        this.diffPath = diffPath;
    }
    async fetch() {
        const diffContent = fs.readFileSync(this.diffPath, 'utf-8');
        // Parse diff to extract files and stats
        const files = this.parseDiff(diffContent);
        const stats = this.calculateStats(files);
        return {
            title: 'Local Diff Review',
            author: 'Local',
            repository: 'local',
            url: `file://${this.diffPath}`,
            baseRef: 'HEAD',
            headRef: 'working',
            description: 'Review of local git diff',
            files,
            commits: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            stats,
        };
    }
    parseDiff(diffContent) {
        const files = [];
        const fileRegex = /^diff --git a\/(.+?) b\/(.+?)$/gm;
        const hunksRegex = /^@@\s+-\d+(?:,\d+)?\s+\+\d+(?:,\d+)?\s+@@/gm;
        let fileMatch;
        while ((fileMatch = fileRegex.exec(diffContent))) {
            const filename = fileMatch[2];
            const patch = this.extractFilePatch(diffContent, fileMatch.index);
            let additions = 0;
            let deletions = 0;
            const lineRegex = /^[+\-]/gm;
            let lineMatch;
            while ((lineMatch = lineRegex.exec(patch))) {
                if (patch[lineMatch.index] === '+') {
                    additions++;
                }
                else if (patch[lineMatch.index] === '-') {
                    deletions++;
                }
            }
            files.push({
                filename,
                language: this.inferLanguage(filename),
                additions,
                deletions,
                patch,
            });
        }
        return files;
    }
    extractFilePatch(diffContent, startIndex) {
        const nextFileIndex = diffContent.indexOf('\ndiff --git', startIndex + 1);
        const endIndex = nextFileIndex === -1 ? diffContent.length : nextFileIndex;
        return diffContent.substring(startIndex, endIndex);
    }
    calculateStats(files) {
        return {
            additions: files.reduce((sum, f) => sum + f.additions, 0),
            deletions: files.reduce((sum, f) => sum + f.deletions, 0),
            filesChanged: files.length,
        };
    }
    inferLanguage(filename) {
        const ext = filename.split('.').pop() || '';
        const langMap = {
            ts: 'typescript',
            tsx: 'typescript',
            js: 'javascript',
            jsx: 'javascript',
            py: 'python',
            go: 'go',
            rb: 'ruby',
            java: 'java',
            cs: 'csharp',
            cpp: 'cpp',
            c: 'c',
            html: 'html',
            css: 'css',
            json: 'json',
            yaml: 'yaml',
            yml: 'yaml',
            md: 'markdown',
        };
        return langMap[ext] || ext;
    }
}
exports.LocalDiffFetcher = LocalDiffFetcher;
//# sourceMappingURL=local-diff-fetcher.js.map