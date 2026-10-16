import { PERCENT_FACTOR } from '@/core/constants/math.const';
import { WINDOW } from '@/core/constants/navigator.const';
import { DOCUMENT, inject, Service } from '@angular/core';
import {
  type EnhancedGenerateContentResponse,
  GenerativeModel,
  type InferenceSource,
  type Part,
  type SchemaRequest,
  type TypedSchema,
  type UsageMetadata,
} from 'firebase/ai';
import { jsonrepair } from 'jsonrepair';
import { AiModelCacheService } from './ai-model-cache.service';
import type { GenerateContentParams, PartialResponse } from './ai.interface';
import { validateAiInputs, validateAiResponse } from './ai.validation';
import { createDummyImagePart } from './dummy-image.util';
import { FALLBACK_IMAGE_SIZE } from './image.const';
import type { InferenceMetadata } from './inference-metadata.interface';
import type { PreWarmOptions } from './model-config-params.interface';
import { ZERO_TOKEN_SUMMARY } from './token-usage.const';
import type { TokenModalityBreakdown, TokenSummary, TokenUsage } from './token-usage.interface';

@Service()
export class AiService {
  readonly #cacheService = inject(AiModelCacheService);
  readonly #document = inject(DOCUMENT);
  readonly #win = inject(WINDOW);

  private isWebGPUSupported(): boolean {
    return Boolean(this.#win?.navigator?.gpu);
  }

  private async getCachedModel({ schema, systemInstruction }: GenerateContentParams): Promise<GenerativeModel> {
    const model = await this.#cacheService.getOrCreateModel({
      schema,
      systemInstruction,
    });

    return model;
  }

  /**
   * Pre-warms and caches the on-device model configuration in the background.
   */
  async preWarmModel(params: GenerateContentParams, options: PreWarmOptions = {}): Promise<void> {
    const model = await this.getCachedModel(params);
    await this.downloadDeviceModel(model);

    if (options.runDummyQuery) {
      if (!this.isWebGPUSupported()) {
        console.log('WebGPU is not supported on this device. Skipping on-device shader compilation.');
        return;
      }

      try {
        const size = options.dummySize || FALLBACK_IMAGE_SIZE;
        const dummyImagePart = createDummyImagePart(this.#document, size);

        const request = this.constructRequest({
          ...params,
          contents: ['Respond with empty JSON', dummyImagePart],
        });

        await model.generateContent(request);
        console.log(`WebGPU shaders pre-compiled successfully for shape ${size}x${size}!`);
      } catch (err) {
        console.warn('Silent WebGPU dummy query skipped or failed:', err);
      }
    }
  }

  async *generateContentStream<T>(params: GenerateContentParams): AsyncGenerator<PartialResponse<T>> {
    validateAiInputs(params.contents);
    const model = await this.getCachedModel(params);
    const request = this.constructRequest(params);

    await this.downloadDeviceModel(model);

    const result = await model.generateContentStream(request);
    let accumulatedText = '';
    let latestUsage: UsageMetadata | undefined = undefined;

    for await (const chunk of result.stream) {
      try {
        if (chunk.usageMetadata) {
          latestUsage = chunk.usageMetadata;
        }
        accumulatedText = accumulatedText + chunk.text();
        const parsed = this.parseStreamJSONResponse<T>(accumulatedText, params.schema);
        yield {
          partialData: parsed,
        };
      } catch (err) {
        // Silently swallow errors during the stream.
        // The loop will try parsing again when the next chunk adds more text!
        console.log('Temporary streaming JSON parse failure (normal during generation):', err);
      }
    }

    // The stream is 100%  completed. Resolve the final Response promise
    const finalResponse = await result.response;
    if (!finalResponse.usageMetadata && latestUsage) {
      finalResponse.usageMetadata = latestUsage;
    }
    validateAiResponse(finalResponse);

    // Parse the final finished output securely
    const finalParsed = this.parseStreamJSONResponse<T>(finalResponse.text(), params.schema);

    yield {
      partialData: finalParsed,
      inferenceMetadata: this.extractInferenceMetadata(finalResponse),
    };
  }

  private parseStreamJSONResponse<T>(text: string, schema?: TypedSchema | SchemaRequest): Partial<T> {
    if (schema) {
      try {
        return JSON.parse(text) as Partial<T>;
      } catch {
        return JSON.parse(jsonrepair(text)) as Partial<T>;
      }
    }

    return { alternativeTexts: [text] } as unknown as Partial<T>;
  }

  private processUsage(response: EnhancedGenerateContentResponse): TokenUsage | undefined {
    if (response.usageMetadata) {
      const usageMetadata = response.usageMetadata;
      const tokenSummary: TokenSummary = {
        totalTokenCount: usageMetadata.totalTokenCount,
        promptTokenCount: usageMetadata.promptTokenCount,
        thoughtsTokenCount: usageMetadata.thoughtsTokenCount || 0,
        cachedContentTokenCount: usageMetadata.cachedContentTokenCount || 0,
        outputTokenCount: usageMetadata.candidatesTokenCount,
      };

      const tokenBreakdown: TokenModalityBreakdown = {
        promptTokensDetails: usageMetadata.promptTokensDetails || [],
        outputTokensDetails: usageMetadata.candidatesTokensDetails || [],
        cacheTokensDetails: usageMetadata.cacheTokensDetails || [],
      };

      return {
        tokenSummary,
        tokenBreakdown,
      };
    }

    return undefined;
  }

  private extractInferenceMetadata(response: EnhancedGenerateContentResponse | undefined): InferenceMetadata {
    let source: InferenceSource = 'on_device';
    let thoughtSummary = 'No thought summary';
    let tokenSummary: TokenSummary | undefined = undefined;
    let tokenModalityBreakdown: TokenModalityBreakdown | undefined = undefined;
    if (response) {
      source = response.inferenceSource || 'on_device';
      thoughtSummary = response.thoughtSummary?.() || 'No thought summary';
      const usageGroup = this.processUsage(response);
      tokenSummary = usageGroup?.tokenSummary ?? ZERO_TOKEN_SUMMARY;
      tokenModalityBreakdown = usageGroup?.tokenBreakdown;
    }
    return { source, thoughtSummary, tokenSummary, tokenModalityBreakdown };
  }

  private async downloadDeviceModel(model: GenerativeModel): Promise<void> {
    // `initializeDeviceModel` must be called:
    // (1) after or on an end-user page interaction such as a button click
    // and
    // (2) before any queries to the model (such as `generateContent()`)
    // You may want to `await` this promise if using `ONLY_ON_DEVICE` (see note below).
    if (model) {
      const roundPercentage = 10000;
      await model.initializeDeviceModel((val) =>
        console.log(`Download progress: ${Math.round(val * roundPercentage) / PERCENT_FACTOR}%`),
      );
    }
  }

  private constructRequest(params: GenerateContentParams): string | (string | Part)[] {
    return typeof params.contents === 'string' || Array.isArray(params.contents) ? params.contents : [params.contents];
  }
}
