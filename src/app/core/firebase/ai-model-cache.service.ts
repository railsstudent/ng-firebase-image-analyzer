import { inject, Service } from '@angular/core';
import { GenerativeModel, getGenerativeModel, HybridParams, InferenceMode, ThinkingLevel } from 'firebase/ai';
import { getValue } from 'firebase/remote-config';
import { FIREBASE_AI } from './ai.const';
import { ConfigService } from './config.service';
import { injectOnlineStatus } from './connection.util';
import { ModelConfigParams } from './model-config-params.type';
import { SAFETY_SETTINGS } from './safety-settings.const';

@Service()
export class AiModelCacheService {
  #ai = inject(FIREBASE_AI);
  #configService = inject(ConfigService);
  #isOnline = injectOnlineStatus();
  #modelCache = new Map<string, GenerativeModel>();

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
    const remoteConfig = this.#configService.RemoteConfig;
    const model = getValue(remoteConfig, 'geminiModelName').asString() || 'gemini-3.5-flash';
    const rawThinkingLevel = getValue(remoteConfig, 'thinkingLevel').asString() || 'LOW';
    const systemInstruction = config.systemInstruction || '';
    const schemaKey = config.schema ? JSON.stringify(config.schema) : 'no-schema';

    return `${model}_${rawThinkingLevel}_${systemInstruction}_${schemaKey}`;
  }

  private constructModelParams({ schema, systemInstruction }: ModelConfigParams): HybridParams {
    const remoteConfig = this.#configService.RemoteConfig;
    const model = getValue(remoteConfig, 'geminiModelName').asString() || 'gemini-3.5-flash';
    const rawThinkingLevel = getValue(remoteConfig, 'thinkingLevel').asString() || 'LOW';
    const thinkingLevel = ThinkingLevel[rawThinkingLevel as keyof typeof ThinkingLevel];
    const isOnline = this.#isOnline();
    const mode = isOnline ? InferenceMode.PREFER_ON_DEVICE : InferenceMode.ONLY_ON_DEVICE;

    const modelParam: HybridParams = {
      mode,
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
}
