import { ModelReview, IProvider } from '../types';
export declare abstract class BaseProvider implements IProvider {
    abstract name: string;
    abstract modelId: string;
    abstract review(prDiff: string, prContext: string): Promise<ModelReview>;
    protected parseJsonResponse(content: string): any;
    protected withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T>;
}
//# sourceMappingURL=base-provider.d.ts.map