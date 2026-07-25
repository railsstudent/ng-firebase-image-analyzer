import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AiService } from './ai.service';
import { AiModelCacheService } from './ai-model-cache.service';

/* eslint-disable @typescript-eslint/no-explicit-any */
describe('AiService', () => {
  let service: AiService;
  let mockCacheService: any;
  let mockGenerativeModel: any;

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
    };

    mockCacheService = {
      getOrCreateModel: vi.fn().mockReturnValue(mockGenerativeModel),
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

  describe('generateContent', () => {
    it('should validate inputs, compile models, and return response metadata', async () => {
      const params = { contents: 'Analyze this sample prompt' };
      const response = await service.generateContent(params);

      expect(mockCacheService.getOrCreateModel).toHaveBeenCalledWith({
        schema: undefined,
        systemInstruction: undefined,
      });
      expect(mockGenerativeModel.initializeDeviceModel).toHaveBeenCalled();
      expect(mockGenerativeModel.generateContent).toHaveBeenCalled();
      expect(response.candidates?.[0].finishReason).toBe('STOP');
    });

    it('should throw error for empty/whitespace contents', async () => {
      const params = { contents: '   ' };
      await expect(service.generateContent(params)).rejects.toThrow();
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
        } as any);

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

  describe('processUsage', () => {
    it('should parse usage metadata correctly', () => {
      const responseMock: any = {
        usageMetadata: {
          totalTokenCount: 150,
          promptTokenCount: 90,
          thoughtsTokenCount: 10,
          candidatesTokenCount: 50,
        },
      };

      const usage = service.processUsage(responseMock);

      expect(usage).toBeDefined();
      expect(usage?.tokenSummary.totalTokenCount).toBe(150);
      expect(usage?.tokenSummary.promptTokenCount).toBe(90);
      expect(usage?.tokenSummary.thoughtsTokenCount).toBe(10);
      expect(usage?.tokenSummary.outputTokenCount).toBe(50);
    });

    it('should return undefined if usageMetadata is missing', () => {
      const responseMock: any = {};
      const usage = service.processUsage(responseMock);
      expect(usage).toBeUndefined();
    });
  });
});
