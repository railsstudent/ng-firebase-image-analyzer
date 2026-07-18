import { inject, Service } from '@angular/core';
import {
  EnhancedGenerateContentResponse,
  GenerateContentResponse,
  GenerateContentStreamResult,
  GenerativeModel,
} from 'firebase/ai';
import { GenerateContentParams } from '../types/ai.types';
import { PreWarmOptions } from '../types/pre-warm-options.type';
import { TokenModalityBreakdown, TokenSummary, TokenUsage } from '../types/token-usage.type';
import { AiModelCacheService } from './ai-model-cache.service';

@Service()
export class AiService {
  #cacheService = inject(AiModelCacheService);

  private getCachedModel({ schema, systemInstruction }: GenerateContentParams) {
    const model = this.#cacheService.getOrCreateModel({
      schema,
      systemInstruction,
    });

    return model;
  }

  /**
   * Pre-warms and caches the on-device model configuration in the background.
   */
  async preWarmModel(params: GenerateContentParams, options: PreWarmOptions = {}): Promise<void> {
    const model = this.getCachedModel(params);
    await this.downloadDeviceModel(model);

    if (options.runDummyQuery) {
      const isWebGPUSupported = typeof navigator !== 'undefined' && !!navigator.gpu;
      if (!isWebGPUSupported) {
        console.log('WebGPU is not supported on this device. Skipping on-device shader compilation.');
        return;
      }

      const size = options.dummySize || 512;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, size, size);
        }
        const dummyBase64 = canvas.toDataURL('image/jpeg', 0.1).split(',')[1];

        const dummyImagePart = {
          inlineData: {
            data: dummyBase64,
            mimeType: 'image/jpeg',
          },
        };

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

  async generateContent(params: GenerateContentParams): Promise<EnhancedGenerateContentResponse> {
    this.validateInputs(params.contents);
    const model = this.getCachedModel(params);
    const request = this.constructRequest(params);

    await this.downloadDeviceModel(model);

    const result = await model.generateContent(request);
    this.validateResponse(result.response);
    return result.response;
  }

  async generateContentStream(params: GenerateContentParams): Promise<GenerateContentStreamResult> {
    this.validateInputs(params.contents);
    const model = this.getCachedModel(params);
    const request = this.constructRequest(params);

    await this.downloadDeviceModel(model);

    const result = await model.generateContentStream(request);
    const originalResponsePromise = result.response;
    result.response = originalResponsePromise.then((response) => {
      this.validateResponse(response);
      return response;
    });

    return result;
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
      await model.initializeDeviceModel((val) => console.log(`Download progress: ${Math.round(val * 10000) / 100}%`));
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
      if (contents.length === 0) {
        throw new Error('Input contents array cannot be empty.');
      }
      for (const item of contents) {
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
      return;
    }

    if (typeof contents === 'object') {
      if (Object.keys(contents).length === 0) {
        throw new Error('Input Part object cannot be empty.');
      }
      return;
    }

    throw new Error('Invalid input contents type.');
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
