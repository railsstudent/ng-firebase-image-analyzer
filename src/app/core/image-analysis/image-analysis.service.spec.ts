import { AiService } from '@/core/firebase';
import { collectStream, createMockStream } from '@/testing/ai-stream.mock';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ImageAnalysisResponse } from './image-analysis.interface';
import { IMAGE_ANALYSIS_USER_PROMPT, SYSTEM_INSTRUCTION } from './image-analysis.prompt';
import { ImageAnalysisSchema } from './image-analysis.schema';
import { ImageAnalysisService } from './image-analysis.service';

describe('ImageAnalysisService', () => {
  let service: ImageAnalysisService;
  let mockAiService: {
    generateContentStream: ReturnType<typeof vi.fn>;
    preWarmModel: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockAiService = {
      generateContentStream: vi.fn(),
      preWarmModel: vi.fn().mockResolvedValue(undefined),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ImageAnalysisService,
        { provide: AiService, useValue: mockAiService },
      ],
    });

    service = TestBed.inject(ImageAnalysisService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('preWarm', () => {
    it('calls preWarmModel on AiService with configured schema and instructions', async () => {
      await service.preWarm();

      expect(mockAiService.preWarmModel).toHaveBeenCalledTimes(1);
      expect(mockAiService.preWarmModel).toHaveBeenCalledWith(
        {
          systemInstruction: SYSTEM_INSTRUCTION,
          schema: ImageAnalysisSchema,
          contents: [],
        },
        {
          runDummyQuery: true,
          dummySize: 512,
        },
      );
    });

    it('reuses existing preWarm promise on repeated invocations', async () => {
      const p1 = service.preWarm();
      const p2 = service.preWarm();

      await Promise.all([p1, p2]);

      expect(mockAiService.preWarmModel).toHaveBeenCalledTimes(1);
    });
  });

  describe('analyzeImageStream', () => {
    const mockFile = new File(['mock content'], 'test.png', { type: 'image/png' });

    beforeEach(() => {
      // Mock URL.createObjectURL and URL.revokeObjectURL
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      vi.spyOn(URL, 'revokeObjectURL').mockReturnValue(undefined);

      // Stub HTMLCanvasElement and 2D context for headless environment
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
        drawImage: vi.fn(),
      } as unknown as CanvasRenderingContext2D);

      vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => {
        callback(new Blob(['resized image content'], { type: 'image/jpeg' }));
      });

      // Stub Image constructor so onload fires asynchronously
      class MockImage {
        onload: (() => void) | null = null;
        onerror: ((err: unknown) => void) | null = null;
        set src(_val: string) {
          setTimeout(() => this.onload?.(), 0);
        }
      }
      vi.stubGlobal('Image', MockImage);
    });

    it('streams analysis chunks and passes through inferenceMetadata', async () => {
      const mockMetadata = {
        source: 'on_device' as const,
        thoughtSummary: 'Detected natural scene elements',
        tokenSummary: {
          promptTokenCount: 50,
          outputTokenCount: 30,
          totalTokenCount: 80,
          thoughtsTokenCount: 0,
          cachedContentTokenCount: 0,
        },
      };

      const finalAnalysisPayload: Partial<ImageAnalysisResponse> = {
        alternativeTexts: ['A peaceful mountain lake at sunrise'],
        tags: [{ name: 'lake', sentence: 'The lake reflects the morning sky.' }],
        recommendations: [{ recommendation: 'Framing', sentence: 'Crop closer to the water.' }],
      };

      mockAiService.generateContentStream.mockResolvedValue(
        createMockStream([
          {
            partialData: {
              alternativeTexts: ['A peaceful mountain'],
            },
          },
          {
            partialData: finalAnalysisPayload,
            inferenceMetadata: mockMetadata,
          },
        ]),
      );

      const chunks = await collectStream(service.analyzeImageStream(mockFile));

      expect(mockAiService.generateContentStream).toHaveBeenCalledWith(
        expect.objectContaining({
          systemInstruction: SYSTEM_INSTRUCTION,
          schema: ImageAnalysisSchema,
          contents: [IMAGE_ANALYSIS_USER_PROMPT, expect.any(Object)],
        }),
      );

      expect(chunks).toHaveLength(2);

      // Intermediate chunk: defaults for inference metadata
      expect(chunks[0].source).toBe('on_device');
      expect(chunks[0].thoughtSummary).toBe('No thought summary');
      expect(chunks[0].analysis.alternativeTexts).toEqual(['A peaceful mountain']);

      // Final chunk: populated inference metadata passed through
      expect(chunks[1].source).toBe('on_device');
      expect(chunks[1].thoughtSummary).toBe('Detected natural scene elements');
      expect(chunks[1].tokenSummary).toEqual({
        promptTokenCount: 50,
        outputTokenCount: 30,
        totalTokenCount: 80,
        thoughtsTokenCount: 0,
        cachedContentTokenCount: 0,
      });
      expect(chunks[1].analysis).toEqual(finalAnalysisPayload);
    });

    it('uses custom prompt when provided', async () => {
      const customPrompt = 'Describe artistic style and lighting:';
      mockAiService.generateContentStream.mockResolvedValue(
        createMockStream([
          {
            partialData: { alternativeTexts: ['Artistic composition'] },
          },
        ]),
      );

      await collectStream(service.analyzeImageStream(mockFile, customPrompt));

      expect(mockAiService.generateContentStream).toHaveBeenCalledWith(
        expect.objectContaining({
          contents: [customPrompt, expect.any(Object)],
        }),
      );
    });
  });
});
