import * as fs from 'fs';
import { PRData, PRFile, PRCommit } from '../types';
import { IFetcher } from './base-fetcher';

export class LocalDiffFetcher implements IFetcher {
  private diffPath: string;

  constructor(diffPath: string) {
    if (!fs.existsSync(diffPath)) {
      throw new Error(`Diff file not found: ${diffPath}`);
    }
    this.diffPath = diffPath;
  }

  async fetch(): Promise<PRData> {
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

  private parseDiff(diffContent: string): PRFile[] {
    const files: PRFile[] = [];
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
        } else if (patch[lineMatch.index] === '-') {
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

  private extractFilePatch(diffContent: string, startIndex: number): string {
    const nextFileIndex = diffContent.indexOf('\ndiff --git', startIndex + 1);
    const endIndex = nextFileIndex === -1 ? diffContent.length : nextFileIndex;
    return diffContent.substring(startIndex, endIndex);
  }

  private calculateStats(files: PRFile[]) {
    return {
      additions: files.reduce((sum, f) => sum + f.additions, 0),
      deletions: files.reduce((sum, f) => sum + f.deletions, 0),
      filesChanged: files.length,
    };
  }

  private inferLanguage(filename: string): string {
    const ext = filename.split('.').pop() || '';
    const langMap: Record<string, string> = {
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
