import { PRData } from '../types';
import { IFetcher } from './base-fetcher';
export declare class LocalDiffFetcher implements IFetcher {
    private diffPath;
    constructor(diffPath: string);
    fetch(): Promise<PRData>;
    private parseDiff;
    private extractFilePatch;
    private calculateStats;
    private inferLanguage;
}
//# sourceMappingURL=local-diff-fetcher.d.ts.map