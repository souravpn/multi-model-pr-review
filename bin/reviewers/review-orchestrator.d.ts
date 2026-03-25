import { ModelReview, IProvider } from '../types';
export declare class ReviewOrchestrator {
    private providers;
    private prDiff;
    private prContext;
    private timeout;
    constructor(providers: IProvider[], prDiff: string, prContext: string, timeoutSeconds?: number);
    orchestrate(): Promise<ModelReview[]>;
}
//# sourceMappingURL=review-orchestrator.d.ts.map