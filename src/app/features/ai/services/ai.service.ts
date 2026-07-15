import { FIREBASE_AI } from '@/features/ai/constants/ai.const';
import { ConfigService } from '@/features/ai/services/config.service';
import { inject, Service } from '@angular/core';
import {
  EnhancedGenerateContentResponse,
  GenerateContentResponse,
  GenerateContentStreamResult,
  GenerativeModel,
  getGenerativeModel,
  HybridParams,
  InferenceMode,
  ThinkingLevel,
} from 'firebase/ai';
import { getValue } from 'firebase/remote-config';
import { SAFETY_SETTINGS } from '../constants/safety-settings.const';
import { GenerateContentParams } from '../types/ai.types';
import { TokenModalityBreakdown, TokenSummary, TokenUsage } from '../types/token-usage.type';

@Service()
export class AiService {
  #ai = inject(FIREBASE_AI);
  #configService = inject(ConfigService);

  async generateContent(params: GenerateContentParams): Promise<EnhancedGenerateContentResponse> {
    const { model, request } = this.preprocessParams(params);

    await this.downloadDeviceModel(model);

    const result = await model.generateContent(request);
    this.validateResponse(result.response);
    return result.response;
  }

  async generateContentStream(params: GenerateContentParams): Promise<GenerateContentStreamResult> {
    const { model, request } = this.preprocessParams(params);

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

  private preprocessParams(params: GenerateContentParams) {
    this.validateInputs(params.contents);
    const modelParams = this.constructModelParams(params);
    const model = getGenerativeModel(this.#ai, modelParams);
    const request = this.constructRequest(params);
    return { model, request };
  }

  private constructModelParams({ schema, systemInstruction }: GenerateContentParams): HybridParams {
    const remoteConfig = this.#configService.RemoteConfig;
    const model = getValue(remoteConfig, 'geminiModelName').asString() || 'gemini-3.5-flash';
    const rawThinkingLevel = getValue(remoteConfig, 'thinkingLevel').asString() || 'LOW';
    const thinkingLevel = ThinkingLevel[rawThinkingLevel as keyof typeof ThinkingLevel];

    const modelParam: HybridParams = {
      mode: InferenceMode.PREFER_ON_DEVICE,
      onDeviceParams: {
        promptOptions: {
          responseConstraint: schema,
        },
      },
      inCloudParams: {
        model,
        generationConfig: {
          responseMimeType: schema ? 'application/json' : undefined,
          responseSchema: schema,
          thinkingConfig: {
            thinkingLevel,
            includeThoughts: true,
          },
        },
        safetySettings: SAFETY_SETTINGS,
        systemInstruction,
      },
    };

    return modelParam;
  }

  private constructRequest(params: GenerateContentParams) {
    return typeof params.contents === 'string' || Array.isArray(params.contents) ? params.contents : [params.contents];
  }
}
