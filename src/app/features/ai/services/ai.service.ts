import { FIREBASE_AI } from '@/features/ai/constants/ai.constants';
import { ConfigService } from '@/features/ai/services/config.service';
import { inject, Service } from '@angular/core';
import {
  GenerateContentResponse,
  GenerateContentStreamResult,
  getGenerativeModel,
  HarmBlockThreshold,
  HarmCategory,
  HybridParams,
  InferenceMode,
  ThinkingLevel,
} from 'firebase/ai';
import { getValue } from 'firebase/remote-config';
import { GenerateContentParams } from '../types/ai.types';

@Service()
export class AiService {
  #ai = inject(FIREBASE_AI);
  #configService = inject(ConfigService);

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

  async generateContent(params: GenerateContentParams): Promise<GenerateContentResponse> {
    this.validateInputs(params.contents);

    const modelParams = this.constructModelParams(params);
    const model = getGenerativeModel(this.#ai, modelParams);
    const request = this.constructRequest(params);

    const result = await model.generateContent(request);
    this.validateResponse(result.response);
    return result.response;
  }

  async generateContentStream(params: GenerateContentParams): Promise<GenerateContentStreamResult> {
    this.validateInputs(params.contents);

    const modelParams = this.constructModelParams(params);
    const model = getGenerativeModel(this.#ai, modelParams);

    const request = this.constructRequest(params);
    const result = await model.generateContentStream(request);

    const originalResponsePromise = result.response;
    result.response = originalResponsePromise.then((response) => {
      this.validateResponse(response);
      return response;
    });

    return result;
  }

  private constructModelParams(params: GenerateContentParams): HybridParams {
    const remoteConfig = this.#configService.RemoteConfig;
    const model = getValue(remoteConfig, 'geminiModelName').asString() || 'gemini-3.5-flash';
    const rawThinkingLevel = getValue(remoteConfig, 'thinkingLevel').asString() || 'LOW';
    const thinkingLevel = ThinkingLevel[rawThinkingLevel as keyof typeof ThinkingLevel];

    const modelParam: HybridParams = {
      mode: InferenceMode.PREFER_ON_DEVICE,
      onDeviceParams: {
        promptOptions: {
          responseConstraint: params.schema,
        },
      },
      inCloudParams: {
        model,
        generationConfig: {
          responseMimeType: params.schema ? 'application/json' : undefined,
          responseSchema: params.schema,
          thinkingConfig: {
            thinkingLevel,
            includeThoughts: true,
          },
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
        systemInstruction: params.systemInstruction,
      },
    };

    return modelParam;
  }

  private constructRequest(params: GenerateContentParams) {
    return typeof params.contents === 'string' || Array.isArray(params.contents) ? params.contents : [params.contents];
  }
}
