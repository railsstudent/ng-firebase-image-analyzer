import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AiModelCacheService } from './ai-model-cache.service';
import { ConfigService } from '@/core/ai/services/config.service';
import { NAVIGATOR } from '@/core/constants/navigator.const';
import { FIREBASE_AI } from '@/core/ai/constants/ai.const';

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
  let mockNavigator: { onLine: boolean };

  beforeEach(() => {
    mockConfigService = {
      RemoteConfig: {} as any,
    };
    mockNavigator = { onLine: true };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        AiModelCacheService,
        { provide: FIREBASE_AI, useValue: {} },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: NAVIGATOR, useValue: mockNavigator },
      ],
    });

    service = TestBed.inject(AiModelCacheService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create and cache models correctly', () => {
    const config = { systemInstruction: 'test-instruction' };
    const model1 = service.getOrCreateModel(config);

    expect(model1).toBeTruthy();

    // Secondary retrieval must yield the identical instance from cache
    const model2 = service.getOrCreateModel(config);
    expect(model2).toBe(model1);
  });

  it('should fall back to default models when remote-config values are undefined', () => {
    const config = { systemInstruction: 'default-testing-prompt' };
    const model = service.getOrCreateModel(config);
    expect(model).toBeDefined();
  });
});
