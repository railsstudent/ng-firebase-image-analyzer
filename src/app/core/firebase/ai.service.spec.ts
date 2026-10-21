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
    it('should stream generated content chunks and emit inferenceMetadata on final chunk', async () => {
      const mockStreamResponse = {
        text: () => '{"caption": "A test image"}',
        candidates: [{ finishReason: 'STOP', content: {} }],
        inferenceSource: 'on_device' as const,
        thoughtSummary: () => 'Analyzed image composition',
        usageMetadata: {
          totalTokenCount: 150,
          promptTokenCount: 90,
          thoughtsTokenCount: 10,
          candidatesTokenCount: 50,
          promptTokensDetails: [{ modality: 'TEXT', tokenCount: 90 }],
          candidatesTokensDetails: [{ modality: 'TEXT', tokenCount: 50 }],
        },
      };

      mockGenerativeModel.generateContentStream = vi.fn().mockResolvedValue({
        stream: (async function* () {
          for (let i = 1; i <= 10; i = i + 1) {
            yield {
              text: () => `{"caption": "A partial caption ${i}"}`,
              usageMetadata: { totalTokenCount: 40, promptTokenCount: 20, candidatesTokenCount: 20 },
            };
          }
        })(),
        response: Promise.resolve(mockStreamResponse),
      });

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
      expect(results).toHaveLength(2);

      // Intermediate chunk: partial data, no inferenceMetadata
      expect(results[0].partialData).toBeDefined();
      expect(results[0].inferenceMetadata).toBeUndefined();

      // Final chunk: final parsed data and populated inferenceMetadata
      expect(results[1].partialData).toBeDefined();
      expect(results[1].inferenceMetadata).toEqual({
        source: 'on_device',
        displaySource: 'Gemini Nano',
        thoughtSummary: 'Analyzed image composition',
        tokenSummary: {
          totalTokenCount: 150,
          promptTokenCount: 90,
          thoughtsTokenCount: 10,
          cachedContentTokenCount: 0,
          outputTokenCount: 50,
        },
        tokenModalityBreakdown: {
          promptTokensDetails: [{ modality: 'TEXT', tokenCount: 90 }],
          outputTokensDetails: [{ modality: 'TEXT', tokenCount: 50 }],
          cacheTokensDetails: [],
        },
      });
    });

    it('should provide default inferenceMetadata on final chunk when response fields are omitted', async () => {
      const minimalResponse = {
        text: () => '{"caption": "Minimal test"}',
        candidates: [{ finishReason: 'STOP', content: {} }],
      };

      mockGenerativeModel.generateContentStream = vi.fn().mockResolvedValue({
        stream: (async function* () {
          yield { text: () => '{"caption": "Minimal"}' };
        })(),
        response: Promise.resolve(minimalResponse),
      });

      const results = [];
      for await (const chunk of service.generateContentStream({ contents: 'test stream' })) {
        results.push(chunk);
      }

      expect(results).toHaveLength(1);
      expect(results[0].inferenceMetadata).toEqual({
        source: 'on_device',
        displaySource: 'Unknown',
        thoughtSummary: 'No thought summary',
        tokenSummary: {
          totalTokenCount: 0,
          promptTokenCount: 0,
          thoughtsTokenCount: 0,
          cachedContentTokenCount: 0,
          outputTokenCount: 0,
        },
        tokenModalityBreakdown: undefined,
      });
    });

    it('should respect custom inferenceSource and thoughtSummary when provided', async () => {
      const cloudResponse = {
        text: () => '{"caption": "Cloud test"}',
        candidates: [{ finishReason: 'STOP', content: {} }],
        inferenceSource: 'in_cloud' as const,
        thoughtSummary: () => 'Synthesized via cloud model',
      };

      mockGenerativeModel.generateContentStream = vi.fn().mockResolvedValue({
        stream: (async function* () {
          yield { text: () => '{"caption": "Cloud"}' };
        })(),
        response: Promise.resolve(cloudResponse),
      });

      const results = [];
      for await (const chunk of service.generateContentStream({ contents: 'test stream' })) {
        results.push(chunk);
      }

      expect(results).toHaveLength(1);
      expect(results[0].inferenceMetadata?.source).toBe('in_cloud');
      expect(results[0].inferenceMetadata?.displaySource).toBe('Cloud AI');
      expect(results[0].inferenceMetadata?.thoughtSummary).toBe('Synthesized via cloud model');
    });

    it('should fallback displaySource to Unknown when response is undefined', async () => {
      mockGenerativeModel.generateContentStream = vi.fn().mockResolvedValue({
        stream: (async function* () {
          yield { text: () => '{"caption": "No response object"}' };
        })(),
        response: Promise.resolve(undefined),
      });

      const results = [];
      for await (const chunk of service.generateContentStream({ contents: 'test stream' })) {
        results.push(chunk);
      }

      expect(results).toHaveLength(1);
      expect(results[0].inferenceMetadata?.displaySource).toBe('Unknown');
    });

    describe('stream chunk buffering', () => {
      it('should yield 0 intermediate chunks and 1 final chunk from response resolution when stream has fewer than 10 chunks', async () => {
        mockGenerativeModel.generateContentStream = vi.fn().mockResolvedValue({
          stream: (async function* () {
            yield { text: () => '{"caption": "First part, ' };
            yield { text: () => 'second part"}' };
          })(),
          response: Promise.resolve({
            text: () => '{"caption": "First part, second part"}',
            candidates: [{ finishReason: 'STOP', content: {} }],
          }),
        });

        const results = [];
        for await (const chunk of service.generateContentStream({ contents: 'test stream' })) {
          results.push(chunk);
        }

        expect(results).toHaveLength(1);
        expect(results[0].partialData).toBeDefined();
        expect(results[0].inferenceMetadata).toBeDefined();
      });

      it('should yield 1 intermediate chunk on the 10th chunk and 1 final chunk from response resolution when stream has exactly 10 chunks', async () => {
        mockGenerativeModel.generateContentStream = vi.fn().mockResolvedValue({
          stream: (async function* () {
            yield { text: () => '{"items": [1' };
            for (let i = 2; i <= 10; i = i + 1) {
              yield { text: () => `, ${i}` };
            }
          })(),
          response: Promise.resolve({
            text: () => '{"items": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}',
            candidates: [{ finishReason: 'STOP', content: {} }],
          }),
        });

        const results = [];
        for await (const chunk of service.generateContentStream({ contents: 'test stream', schema: {} as never })) {
          results.push(chunk);
        }

        expect(results).toHaveLength(2);
        expect(results[0].partialData).toEqual({ items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] });
        expect(results[0].inferenceMetadata).toBeUndefined();
        expect(results[1].partialData).toEqual({ items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] });
        expect(results[1].inferenceMetadata).toBeDefined();
      });

      it('should yield 2 intermediate chunks at chunks 10 and 20 and flush trailing 2 chunks via the final chunk for 12 chunks', async () => {
        mockGenerativeModel.generateContentStream = vi.fn().mockResolvedValue({
          stream: (async function* () {
            yield { text: () => '{"items": [1' };
            for (let i = 2; i <= 21; i = i + 1) {
              yield { text: () => `, ${i}` };
            }
            yield { text: () => ', 22]}' };
          })(),
          response: Promise.resolve({
            text: () => '{"items": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]}',
            candidates: [{ finishReason: 'STOP', content: {} }],
          }),
        });

        const results = [];
        for await (const chunk of service.generateContentStream({ contents: 'test stream', schema: {} as never })) {
          results.push(chunk);
        }

        expect(results).toHaveLength(3);
        expect(results[0].partialData).toEqual({ items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] });
        expect(results[0].inferenceMetadata).toBeUndefined();
        expect(results[1].partialData).toEqual({
          items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        });
        expect(results[1].inferenceMetadata).toBeUndefined();
        expect(results[2].partialData).toEqual({
          items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
        });
        expect(results[2].inferenceMetadata).toBeDefined();
      });

      it('should not reset bufferedChunkCount if parseStreamJSONResponse fails on chunk 5 and immediately retry and yield on chunk 6 upon valid repair', async () => {
        /* eslint-disable-next-line @typescript-eslint/no-empty-function */
        vi.spyOn(console, 'log').mockImplementation(() => {});

        mockGenerativeModel.generateContentStream = vi.fn().mockResolvedValue({
          stream: (async function* () {
            // Chunks 1-4
            yield { text: () => '{"msg": ' };
            yield { text: () => '"' };
            yield { text: () => 'hel' };
            yield { text: () => 'lo' };
            yield { text: () => 'lo' };
            yield { text: () => 'lo' };
            yield { text: () => 'lo' };
            yield { text: () => 'lo' };
            yield { text: () => 'lo' };
            // Chunk 10: causes jsonrepair to throw syntax error (lone slash after quote)
            yield { text: () => '/' };
            // Chunk 11: valid continuation that resolves the syntax
            yield { text: () => 'world"}' };
          })(),
          response: Promise.resolve({
            text: () => '{"msg": "hellolololololo/world"}',
            candidates: [{ finishReason: 'STOP', content: {} }],
          }),
        });

        const results = [];
        for await (const chunk of service.generateContentStream({ contents: 'test stream', schema: {} as never })) {
          results.push(chunk);
        }

        expect(results).toHaveLength(2);
        expect(results[0].partialData).toEqual({ msg: 'hellolololololo/world' });
        expect(results[0].inferenceMetadata).toBeUndefined();
        expect(results[1].partialData).toEqual({ msg: 'hellolololololo/world' });
        expect(results[1].inferenceMetadata).toBeDefined();
      });
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

      it('should proceed and perform dummy shader pre-compilation with specified dummySize', async () => {
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
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('pre-compiled successfully for shape 128x128!'),
        );
      });

      it('should use FALLBACK_IMAGE_SIZE for shape log when dummySize is omitted', async () => {
        const params = { contents: 'pre-warm prompt' };
        /* eslint-disable-next-line @typescript-eslint/no-empty-function */
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await service.preWarmModel(params, { runDummyQuery: true });

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('pre-compiled successfully for shape 512x512!'),
        );
      });
    });
  });
});
