import { PRData } from '../types';
import { IFetcher } from './base-fetcher';
export declare class GitHubFetcher implements IFetcher {
    private octokit;
    private owner;
    private repo;
    private prNumber;
    constructor(prUrl: string, token: string);
    fetch(): Promise<PRData>;
    private inferLanguage;
}
//# sourceMappingURL=github-fetcher.d.ts.map