import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { GenerativeModel } from 'firebase/ai';
import { AiModelCacheService } from './ai-model-cache.service';
import { AiService } from './ai.service';

describe('AiService', () => {
  let service: AiService;
  let mockCacheService: Partial<AiModelCacheService>;
  let mockGenerativeModel: Partial<GenerativeModel>;

  beforeEach(() => {
    mockGenerativeModel = {
      initializeDeviceModel: vi.fn().mockResolvedValue(undefined),
      generateContent: vi.fn().mockResolvedValue({
        response: {
          candidates: [{ finishReason: 'STOP', content: {} }],
          usageMetadata: {
            totalTokenCount: 100,
            promptTokenCount: 60,
            candidatesTokenCount: 40,
          },
        },
      }),
      generateContentStream: vi.fn().mockResolvedValue({
        stream: (async function* () {
          yield {
            text: () => '{"caption": "A test image"}',
            usageMetadata: { totalTokenCount: 50, promptTokenCount: 20, candidatesTokenCount: 30 },
          };
        })(),
        response: Promise.resolve({
          text: () => '{"caption": "A test image"}',
          candidates: [{ finishReason: 'STOP', content: {} }],
          usageMetadata: { totalTokenCount: 50, promptTokenCount: 20, candidatesTokenCount: 30 },
        }),
      }),
    };

    mockCacheService = {
      getOrCreateModel: vi.fn().mockResolvedValue(mockGenerativeModel),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        AiService,
        { provide: AiModelCacheService, useValue: mockCacheService },
      ],
    });

    service = TestBed.inject(AiService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateContentStream', () => {
    it('should stream generated content chunks and return final parsed result', async () => {
      const results = [];
      for await (const chunk of service.generateContentStream({ contents: 'test stream' })) {
        results.push(chunk);
      }

      expect(mockCacheService.getOrCreateModel).toHaveBeenCalledWith({
        schema: undefined,
        systemInstruction: undefined,
      });
      expect(mockGenerativeModel.initializeDeviceModel).toHaveBeenCalled();
      expect(mockGenerativeModel.generateContentStream).toHaveBeenCalled();
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('preWarmModel', () => {
    describe('when WebGPU is NOT supported', () => {
      beforeEach(() => {
        // Enforce falsy navigator.gpu
        Object.defineProperty(globalThis.navigator, 'gpu', {
          value: undefined,
          writable: true,
          configurable: true,
        });
      });

      it('should download device assets but skip shader pre-compilation', async () => {
        const params = { contents: 'pre-warm prompt' };
        /* eslint-disable-next-line @typescript-eslint/no-empty-function */
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await service.preWarmModel(params, { runDummyQuery: true });

        expect(mockCacheService.getOrCreateModel).toHaveBeenCalledWith({
          schema: undefined,
          systemInstruction: undefined,
        });
        expect(mockGenerativeModel.initializeDeviceModel).toHaveBeenCalled();
        expect(mockGenerativeModel.generateContent).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('WebGPU is not supported'));
      });
    });

    describe('when WebGPU IS supported (Alternative A)', () => {
      beforeEach(() => {
        // Mock global navigator.gpu to mock client GPU capabilities
        Object.defineProperty(globalThis.navigator, 'gpu', {
          value: {},
          writable: true,
          configurable: true,
        });

        // Spy and stub HTMLCanvasElement to satisfy JSDOM headless canvas
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
          fillStyle: '',
          fillRect: vi.fn(),
        } as unknown as CanvasRenderingContext2D);

        vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/jpeg;base64,dummybase64content');
      });

      afterEach(() => {
        Object.defineProperty(globalThis.navigator, 'gpu', {
          value: undefined,
          writable: true,
          configurable: true,
        });
      });

      it('should proceed and perform dummy shader pre-compilation', async () => {
        const params = { contents: 'pre-warm prompt' };
        /* eslint-disable-next-line @typescript-eslint/no-empty-function */
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await service.preWarmModel(params, { runDummyQuery: true, dummySize: 128 });

        expect(mockCacheService.getOrCreateModel).toHaveBeenCalledWith({
          schema: undefined,
          systemInstruction: undefined,
        });
        expect(mockGenerativeModel.initializeDeviceModel).toHaveBeenCalled();
        expect(mockGenerativeModel.generateContent).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('pre-compiled successfully'));
      });
    });
  });
});
