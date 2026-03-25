import { ModelReview, IProvider } from '../types';

export abstract class BaseProvider implements IProvider {
  abstract name: string;
  abstract modelId: string;

  abstract review(prDiff: string, prContext: string): Promise<ModelReview>;

  protected parseJsonResponse(content: string): any {
    // Extract JSON from content (handle markdown code blocks)
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) ||
                     content.match(/({[\s\S]*})/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonMatch[1]);
  }

  protected async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Request timed out after ${timeoutMs}ms`)),
          timeoutMs
        )
      ),
    ]);
  }
}
