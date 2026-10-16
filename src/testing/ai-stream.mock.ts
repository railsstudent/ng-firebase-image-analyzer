import type { InferenceMetadata } from '@/core/firebase';
import type { EnhancedGenerateContentResponse } from 'firebase/ai';

interface MockStreamChunk<T = Record<string, unknown>> {
  readonly partialData: Partial<T> | Record<string, unknown>;
  readonly response?: EnhancedGenerateContentResponse;
  readonly inferenceMetadata?: InferenceMetadata;
}

/**
 * Collects all yielded items from an async generator into an array.
 */
export async function collectStream<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const items: T[] = [];
  for await (const item of generator) {
    items.push(item);
  }
  return items;
}

/**
 * Creates an async generator yielding partial stream chunks for AiService testing.
 */
export async function* createMockStream<T = Record<string, unknown>>(
  chunks: readonly MockStreamChunk<Record<string, unknown>>[],
): AsyncGenerator<MockStreamChunk<T>> {
  for (const chunk of chunks) {
    yield chunk as MockStreamChunk<T>;
  }
}
