import { WINDOW } from '@/core/constants/navigator.const';
import { inject, Service } from '@angular/core';
import {
  GenerativeModel,
  getGenerativeModel,
  HarmBlockThreshold,
  HarmCategory,
  HybridParams,
  InferenceMode,
} from 'firebase/ai';
import { FIREBASE_AI } from './ai.const';
import { ConfigService } from './config.service';
import { isOnline } from './host.util';
import { ModelConfigParams } from './model-config-params.interface';

const SAFETY_SETTINGS = [
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
];

@Service()
export class AiModelCacheService {
  #ai = inject(FIREBASE_AI);
  #configService = inject(ConfigService);
  #modelCache = new Map<string, GenerativeModel>();
  #win = inject(WINDOW);

  /**
   * Retrieves an existing cached model, or creates a new one and caches it.
   * Only accepts static configuration parameters.
   */
  getOrCreateModel(config: ModelConfigParams): GenerativeModel {
    const cacheKey = this.getCacheKey(config);
    const cachedModel = this.#modelCache.get(cacheKey);
    if (cachedModel) {
      return cachedModel;
    }

    const modelParams = this.constructModelParams(config);
    const model = getGenerativeModel(this.#ai, modelParams);
    this.#modelCache.set(cacheKey, model);
    return model;
  }

  private getCacheKey(config: ModelConfigParams): string {
    const remoteConfig = this.#configService.appConfig;
    const model = remoteConfig.geminiModelName || 'gemini-3.5-flash';
    const systemInstruction = config.systemInstruction || '';
    const schemaKey = config.schema ? JSON.stringify(config.schema) : 'no-schema';

    return `${model}_${remoteConfig.thinkingLevel}_${systemInstruction}_${schemaKey}`;
  }

  private constructModelParams({ schema, systemInstruction }: ModelConfigParams): HybridParams {
    const remoteConfig = this.#configService.appConfig;
    const isOnlineStatus = isOnline(this.#win);
    const mode = isOnlineStatus ? InferenceMode.PREFER_ON_DEVICE : InferenceMode.ONLY_ON_DEVICE;

    const modelParam: HybridParams = {
      mode,
      onDeviceParams: {
        promptOptions: {
          responseConstraint: schema,
        },
      },
      inCloudParams: {
        model: remoteConfig.geminiModelName || 'gemini-3.5-flash',
        generationConfig: {
          responseMimeType: schema ? 'application/json' : undefined,
          responseSchema: schema,
          thinkingConfig: {
            thinkingLevel: remoteConfig.thinkingLevel,
            includeThoughts: true,
          },
        },
        safetySettings: SAFETY_SETTINGS,
        systemInstruction,
      },
    };

    return modelParam;
  }
}
