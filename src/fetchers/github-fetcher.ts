import { Octokit } from '@octokit/rest';
import { PRData, PRFile, PRCommit } from '../types';
import { IFetcher } from './base-fetcher';

export class GitHubFetcher implements IFetcher {
  private octokit: Octokit;
  private owner: string;
  private repo: string;
  private prNumber: number;

  constructor(prUrl: string, token: string) {
    this.octokit = new Octokit({ auth: token });
    const match = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
    if (!match) {
      throw new Error(`Invalid GitHub PR URL: ${prUrl}`);
    }
    this.owner = match[1];
    this.repo = match[2];
    this.prNumber = parseInt(match[3], 10);
  }

  async fetch(): Promise<PRData> {
    const prResponse = await this.octokit.pulls.get({
      owner: this.owner,
      repo: this.repo,
      pull_number: this.prNumber,
    });

    const pr = prResponse.data;

    // Fetch files
    const filesResponse = await this.octokit.pulls.listFiles({
      owner: this.owner,
      repo: this.repo,
      pull_number: this.prNumber,
      per_page: 100,
    });

    const files: PRFile[] = filesResponse.data.map((f) => ({
      filename: f.filename,
      language: this.inferLanguage(f.filename),
      additions: f.additions,
      deletions: f.deletions,
      patch: f.patch || '',
    }));

    // Fetch commits
    const commitsResponse = await this.octokit.pulls.listCommits({
      owner: this.owner,
      repo: this.repo,
      pull_number: this.prNumber,
      per_page: 100,
    });

    const commits: PRCommit[] = commitsResponse.data.map((c) => ({
      sha: c.sha,
      message: c.commit.message,
      author: c.commit.author?.name || 'Unknown',
      timestamp: new Date(c.commit.author?.date || new Date()),
    }));

    return {
      title: pr.title,
      author: pr.user?.login || 'Unknown',
      repository: `${this.owner}/${this.repo}`,
      url: pr.html_url,
      baseRef: pr.base.ref,
      headRef: pr.head.ref,
      description: pr.body || '',
      files,
      commits,
      createdAt: new Date(pr.created_at),
      updatedAt: new Date(pr.updated_at),
      stats: {
        additions: pr.additions,
        deletions: pr.deletions,
        filesChanged: pr.changed_files,
      },
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
