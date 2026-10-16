import { WINDOW } from '@/core/constants';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { getGenerativeModel, InferenceMode, SchemaRequest, SchemaType, ThinkingLevel } from 'firebase/ai';
import { AiModelCacheService } from './ai-model-cache.service';
import { AppRemoteConfig } from './app-remote-config.interface';
import { ConfigService } from './config.service';

describe('AiModelCacheService', () => {
  let service: AiModelCacheService;
  let mockConfigService: {
    appConfig: AppRemoteConfig;
    getAiBackend: ReturnType<typeof vi.fn>;
  };
  let mockWindow: { navigator: { onLine: boolean } };

  beforeEach(() => {
    mockConfigService = {
      appConfig: {
        geminiModelName: 'mock-gemini-model',
        thinkingLevel: ThinkingLevel.LOW,
        vertexAILocation: 'us-central1',
        geminiTTSModelName: 'mock-gemini-tts-model',
        useLimitedUseAppCheckTokens: false,
      } satisfies AppRemoteConfig,
      getAiBackend: vi.fn().mockResolvedValue({}),
    };
    mockWindow = { navigator: { onLine: true } };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        AiModelCacheService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: WINDOW, useValue: mockWindow },
      ],
    });

    service = TestBed.inject(AiModelCacheService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create and cache models correctly', async () => {
    const config = { systemInstruction: 'test-instruction' };
    const model1 = await service.getOrCreateModel(config);

    expect(model1).toBeTruthy();
    expect(mockConfigService.getAiBackend).toHaveBeenCalledTimes(1);
    expect(getGenerativeModel).toHaveBeenCalledTimes(1);

    // Secondary retrieval must yield the identical instance from cache without calling getAiBackend again
    const model2 = await service.getOrCreateModel(config);
    expect(model2).toBe(model1);
    expect(mockConfigService.getAiBackend).toHaveBeenCalledTimes(1);
    expect(getGenerativeModel).toHaveBeenCalledTimes(1);
  });

  it('should create separate cache entries for different configurations', async () => {
    const modelA = await service.getOrCreateModel({ systemInstruction: 'instruction-a' });
    const modelB = await service.getOrCreateModel({ systemInstruction: 'instruction-b' });

    expect(modelA).not.toBe(modelB);
    expect(getGenerativeModel).toHaveBeenCalledTimes(2);
  });

  it('should set PREFER_ON_DEVICE inference mode when online', async () => {
    mockWindow.navigator.onLine = true;
    await service.getOrCreateModel({ systemInstruction: 'online-test' });

    expect(getGenerativeModel).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        mode: InferenceMode.PREFER_ON_DEVICE,
      }),
    );
  });

  it('should set ONLY_ON_DEVICE inference mode when offline', async () => {
    mockWindow.navigator.onLine = false;
    await service.getOrCreateModel({ systemInstruction: 'offline-test' });

    expect(getGenerativeModel).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        mode: InferenceMode.ONLY_ON_DEVICE,
      }),
    );
  });

  it('should configure response schema when schema is provided', async () => {
    const mockSchema: SchemaRequest = { type: SchemaType.OBJECT, properties: { test: { type: SchemaType.STRING } } };
    await service.getOrCreateModel({ systemInstruction: 'schema-test', schema: mockSchema });

    expect(getGenerativeModel).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        onDeviceParams: {
          promptOptions: {
            responseConstraint: mockSchema,
          },
        },
        inCloudParams: expect.objectContaining({
          generationConfig: expect.objectContaining({
            responseMimeType: 'application/json',
            responseSchema: mockSchema,
          }),
        }),
      }),
    );
  });

  it('should fall back to default models when remote-config values are undefined', async () => {
    mockConfigService.appConfig = {
      geminiModelName: '',
      thinkingLevel: ThinkingLevel.LOW,
      vertexAILocation: 'us-central1',
      geminiTTSModelName: '',
      useLimitedUseAppCheckTokens: false,
    };

    const config = { systemInstruction: 'default-testing-prompt' };
    const model = await service.getOrCreateModel(config);

    expect(model).toBeDefined();
    expect(getGenerativeModel).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        inCloudParams: expect.objectContaining({
          model: 'gemini-3.5-flash',
          generationConfig: expect.objectContaining({
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW,
              includeThoughts: true,
            },
          }),
        }),
      }),
    );
  });
});
