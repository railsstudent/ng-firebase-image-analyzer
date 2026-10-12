import { WINDOW } from '@/core/constants/navigator.const';
import { DOCUMENT, inject, Service } from '@angular/core';
import {
  EnhancedGenerateContentResponse,
  GenerateContentResponse,
  GenerativeModel,
  SchemaRequest,
  TypedSchema,
  UsageMetadata,
} from 'firebase/ai';
import { jsonrepair } from 'jsonrepair';
import { AiModelCacheService } from './ai-model-cache.service';
import { GenerateContentParams, PartialResponse } from './ai.interface';
import { FALLBACK_IMAGE_SIZE } from './image.const';
import { TokenModalityBreakdown, TokenSummary, TokenUsage } from './token-usage.interface';
import { PreWarmOptions } from './model-config-params.interface';

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

      const size = options.dummySize || FALLBACK_IMAGE_SIZE;
      try {
        const dummyImagePart = this.makeDummyImagePart(size);

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

  private makeDummyImagePart(size: number) {
    const canvas = this.#document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, size, size);
    }
    const imageQuality = 0.1;
    const dummyBase64 = canvas.toDataURL('image/jpeg', imageQuality).split(',')[1];

    const dummyImagePart = {
      inlineData: {
        data: dummyBase64,
        mimeType: 'image/jpeg',
      },
    };
    return dummyImagePart;
  }

  async *generateContentStream<T>(params: GenerateContentParams): AsyncGenerator<PartialResponse<T>> {
    this.validateInputs(params.contents);
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
    this.validateResponse(finalResponse);

    // Parse the final finished output securely
    const finalParsed = this.parseStreamJSONResponse<T>(finalResponse.text(), params.schema);
    yield {
      partialData: finalParsed,
      response: finalResponse,
    };
  }

  private parseStreamJSONResponse<T>(text: string, schema?: TypedSchema | SchemaRequest) {
    if (schema) {
      try {
        return JSON.parse(text) as Partial<T>;
      } catch {
        return JSON.parse(jsonrepair(text)) as Partial<T>;
      }
    }

    return { alternativeTexts: [text] } as unknown as Partial<T>;
  }

  processUsage(response: EnhancedGenerateContentResponse): TokenUsage | undefined {
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

  private async downloadDeviceModel(model: GenerativeModel) {
    // `initializeDeviceModel` must be called:
    // (1) after or on an end-user page interaction such as a button click
    // and
    // (2) before any queries to the model (such as `generateContent()`)
    // You may want to `await` this promise if using `ONLY_ON_DEVICE` (see note below).
    if (model) {
      const percent = 100;
      const roundPercentage = 10000;
      await model.initializeDeviceModel((val) =>
        console.log(`Download progress: ${Math.round(val * roundPercentage) / percent}%`),
      );
    }
  }

  private validateInputs(contents: unknown): void {
    if (contents === null || contents === undefined) {
      throw new Error('Input contents cannot be null or undefined.');
    }

    if (typeof contents === 'string') {
      if (contents.trim() === '') {
        throw new Error('Input string contents cannot be empty or whitespace.');
      }
      return;
    }

    if (Array.isArray(contents)) {
      this.validateContentsArray(contents);
      return;
    }

    if (typeof contents === 'object') {
      this.validatePartObject(contents);
      return;
    }

    throw new Error('Invalid input contents type.');
  }

  private validateContentsArray(contents: unknown[]): void {
    if (contents.length === 0) {
      throw new Error('Input contents array cannot be empty.');
    }
    for (const item of contents) {
      this.validateArrayItem(item);
    }
  }

  private validateArrayItem(item: unknown): void {
    if (item === null || item === undefined) {
      throw new Error('Input contents array cannot contain null or undefined elements.');
    }
    if (typeof item === 'string') {
      if (item.trim() === '') {
        throw new Error('Input contents array cannot contain empty or whitespace strings.');
      }
    } else {
      // Check if single Part object has keys
      if (Object.keys(item).length === 0) {
        throw new Error('Input contents array cannot contain empty Part objects.');
      }
    }
  }

  private validatePartObject(contents: object): void {
    if (Object.keys(contents).length === 0) {
      throw new Error('Input Part object cannot be empty.');
    }
  }

  private validateResponse(response: GenerateContentResponse): void {
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error('Response candidates are empty or undefined.');
    }
    const firstCandidate = response.candidates[0];
    if (firstCandidate.finishReason && firstCandidate.finishReason !== 'STOP') {
      throw new Error(`Response generation did not finish normally. Reason: ${firstCandidate.finishReason}`);
    }
  }

  private constructRequest(params: GenerateContentParams) {
    return typeof params.contents === 'string' || Array.isArray(params.contents) ? params.contents : [params.contents];
  }
}
