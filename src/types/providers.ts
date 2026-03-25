import { ModelReview } from './review';

export interface IProvider {
  name: string;
  modelId: string;
  review(prDiff: string, prContext: string): Promise<ModelReview>;
}
