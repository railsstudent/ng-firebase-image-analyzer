import { WINDOW } from '@/core/constants/navigator.const';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { getGenerativeModel, InferenceMode, ThinkingLevel } from 'firebase/ai';
import { getValue } from 'firebase/remote-config';
import { AiModelCacheService } from './ai-model-cache.service';
import { FIREBASE_AI } from './ai.const';
import { ConfigService } from './config.service';

vi.mock('firebase/remote-config', () => ({
  getValue: vi.fn((_config, key) => ({
    asString: () => {
      if (key === 'geminiModelName') {
        return 'mock-gemini-model';
      }
      if (key === 'thinkingLevel') {
        return 'LOW';
      }
      return '';
    },
  })),
}));

vi.mock('firebase/ai', () => ({
  getGenerativeModel: vi.fn((_ai, params) => ({
    params,
    initializeDeviceModel: vi.fn().mockResolvedValue(undefined),
    generateContent: vi.fn().mockResolvedValue({}),
  })),
  ThinkingLevel: {
    LOW: 'LOW',
    HIGH: 'HIGH',
  },
  InferenceMode: {
    PREFER_ON_DEVICE: 'PREFER_ON_DEVICE',
    ONLY_ON_DEVICE: 'ONLY_ON_DEVICE',
  },
  HarmCategory: {
    HARM_CATEGORY_SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    HARM_CATEGORY_DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
    HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
  },
  HarmBlockThreshold: {
    BLOCK_ONLY_HIGH: 'BLOCK_ONLY_HIGH',
  },
}));

/* eslint-disable @typescript-eslint/no-explicit-any */
describe('AiModelCacheService', () => {
  let service: AiModelCacheService;
  let mockConfigService: any;
  let mockWindow: { navigator: { onLine: boolean } };

  beforeEach(() => {
    mockConfigService = {
      RemoteConfig: {} as any,
    };
    mockWindow = { navigator: { onLine: true } };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        AiModelCacheService,
        { provide: FIREBASE_AI, useValue: {} },
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

  it('should create and cache models correctly', () => {
    const config = { systemInstruction: 'test-instruction' };
    const model1 = service.getOrCreateModel(config);

    expect(model1).toBeTruthy();
    expect(getGenerativeModel).toHaveBeenCalledTimes(1);

    // Secondary retrieval must yield the identical instance from cache
    const model2 = service.getOrCreateModel(config);
    expect(model2).toBe(model1);
    expect(getGenerativeModel).toHaveBeenCalledTimes(1);
  });

  it('should create separate cache entries for different configurations', () => {
    const modelA = service.getOrCreateModel({ systemInstruction: 'instruction-a' });
    const modelB = service.getOrCreateModel({ systemInstruction: 'instruction-b' });

    expect(modelA).not.toBe(modelB);
    expect(getGenerativeModel).toHaveBeenCalledTimes(2);
  });

  it('should set PREFER_ON_DEVICE inference mode when online', () => {
    mockWindow.navigator.onLine = true;
    service.getOrCreateModel({ systemInstruction: 'online-test' });

    expect(getGenerativeModel).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        mode: InferenceMode.PREFER_ON_DEVICE,
      }),
    );
  });

  it('should set ONLY_ON_DEVICE inference mode when offline', () => {
    mockWindow.navigator.onLine = false;
    service.getOrCreateModel({ systemInstruction: 'offline-test' });

    expect(getGenerativeModel).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        mode: InferenceMode.ONLY_ON_DEVICE,
      }),
    );
  });

  it('should configure response schema when schema is provided', () => {
    const mockSchema = { type: 'OBJECT', properties: { test: { type: 'STRING' } } } as any;
    service.getOrCreateModel({ systemInstruction: 'schema-test', schema: mockSchema });

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

  it('should fall back to default models when remote-config values are undefined', () => {
    vi.mocked(getValue).mockReturnValue({
      asString: () => '',
    } as any);

    const config = { systemInstruction: 'default-testing-prompt' };
    const model = service.getOrCreateModel(config);

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
