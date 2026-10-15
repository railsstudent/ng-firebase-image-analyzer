import { AiService } from '@/core/firebase';
import { collectStream, createMockStream } from '@/testing/ai-stream.mock';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { EnhancedGenerateContentResponse } from 'firebase/ai';
import { EXPECTED_FOOD_COUNT, MAX_HONORABLE_MENTIONS, MIN_HONORABLE_MENTIONS } from './culinary-guide.const';
import type { CulinaryFoodItem, CulinaryLocation, CulinaryRecipeTarget } from './culinary-guide.interface';
import { CULINARY_GUIDE_SYSTEM_INSTRUCTION, RECIPE_PROMPT_INSTRUCTION } from './culinary-guide.prompt';
import { CulinaryRecipeSchema, TopFoodsSchema } from './culinary-guide.schema';
import { CulinaryGuideService } from './culinary-guide.service';

function makeFood(name: string): CulinaryFoodItem {
  return { name, description: `Description for ${name}` };
}

describe('CulinaryGuideService', () => {
  let service: CulinaryGuideService;
  let mockAiService: {
    generateContentStream: ReturnType<typeof vi.fn>;
    processUsage: ReturnType<typeof vi.fn>;
  };

  const mockLocation: CulinaryLocation = { country: 'Japan', city: 'Tokyo' };
  const mockTarget: CulinaryRecipeTarget = { country: 'Japan', city: 'Tokyo', dishName: 'Tonkotsu Ramen' };

  beforeEach(() => {
    mockAiService = {
      generateContentStream: vi.fn(),
      processUsage: vi.fn().mockReturnValue({
        tokenSummary: { promptTokens: 10, candidatesTokens: 20, totalTokens: 30 },
        tokenBreakdown: undefined,
      }),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        CulinaryGuideService,
        { provide: AiService, useValue: mockAiService },
      ],
    });

    service = TestBed.inject(CulinaryGuideService);
  });

  describe('getTopFoodsStream', () => {
    it('yields streaming chunks and terminates cleanly when stream passes completion validation', async () => {
      const mockResponse = {
        inferenceSource: 'on_device' as const,
        thoughtSummary: () => 'Curated 6 iconic Tokyo dishes',
      } as EnhancedGenerateContentResponse;

      const foodsBatch: CulinaryFoodItem[] = [
        makeFood('Sushi'),
        makeFood('Ramen'),
        makeFood('Tempura'),
        makeFood('Soba'),
        makeFood('Yakitori'),
        makeFood('Tonkatsu'),
      ];

      mockAiService.generateContentStream.mockResolvedValue(
        createMockStream([
          { partialData: { foods: foodsBatch.slice(0, 3) } },
          {
            partialData: {
              foods: foodsBatch,
              honorableMentions: ['Monjayaki'],
            },
            response: mockResponse,
          },
        ]),
      );

      const chunks = await collectStream(service.getTopFoodsStream(mockLocation));

      expect(mockAiService.generateContentStream).toHaveBeenCalledTimes(1);
      expect(mockAiService.generateContentStream).toHaveBeenCalledWith(
        expect.objectContaining({
          systemInstruction: CULINARY_GUIDE_SYSTEM_INSTRUCTION,
          schema: TopFoodsSchema,
        }),
      );

      expect(chunks).toHaveLength(2);
      expect(chunks[0].foods).toHaveLength(3);
      expect(chunks[0].honorableMentions).toHaveLength(0);
      expect(chunks[0].thoughtSummary).toBe('No thought summary');

      expect(chunks[1].foods).toHaveLength(6);
      expect(chunks[1].honorableMentions).toEqual(['Monjayaki']);
      expect(chunks[1].thoughtSummary).toBe('Curated 6 iconic Tokyo dishes');
      expect(chunks[1].tokenSummary).toEqual({ promptTokens: 10, candidatesTokens: 20, totalTokens: 30 });
    });

    it('emits reset chunk and retries once when initial attempt yields fewer than 6 foods', async () => {
      const incompleteFoods: CulinaryFoodItem[] = [
        makeFood('Sushi'),
        makeFood('Ramen'),
        makeFood('Tempura'),
        makeFood('Soba'),
        makeFood('Yakitori'),
      ];

      const completeFoods: CulinaryFoodItem[] = [...incompleteFoods, makeFood('Tonkatsu')];

      mockAiService.generateContentStream
        .mockResolvedValueOnce(
          createMockStream([
            {
              partialData: {
                foods: incompleteFoods,
                honorableMentions: ['Monjayaki'],
              },
            },
          ]),
        )
        .mockResolvedValueOnce(
          createMockStream([
            {
              partialData: {
                foods: completeFoods,
                honorableMentions: ['Monjayaki', 'Udon'],
              },
            },
          ]),
        );

      const chunks = await collectStream(service.getTopFoodsStream(mockLocation));

      expect(mockAiService.generateContentStream).toHaveBeenCalledTimes(2);

      expect(chunks).toHaveLength(3);
      // Attempt 1 chunk:
      expect(chunks[0].foods).toHaveLength(5);
      // Reset chunk:
      expect(chunks[1].foods).toHaveLength(0);
      expect(chunks[1].honorableMentions).toHaveLength(0);
      // Attempt 2 chunk:
      expect(chunks[2].foods).toHaveLength(6);
      expect(chunks[2].honorableMentions).toHaveLength(2);
    });

    it('emits reset chunk and retries once when initial attempt has 0 honorable mentions', async () => {
      const sixFoods: CulinaryFoodItem[] = [
        makeFood('Sushi'),
        makeFood('Ramen'),
        makeFood('Tempura'),
        makeFood('Soba'),
        makeFood('Yakitori'),
        makeFood('Tonkatsu'),
      ];

      mockAiService.generateContentStream
        .mockResolvedValueOnce(
          createMockStream([
            {
              partialData: {
                foods: sixFoods,
                honorableMentions: [],
              },
            },
          ]),
        )
        .mockResolvedValueOnce(
          createMockStream([
            {
              partialData: {
                foods: sixFoods,
                honorableMentions: ['Monjayaki'],
              },
            },
          ]),
        );

      const chunks = await collectStream(service.getTopFoodsStream(mockLocation));

      expect(mockAiService.generateContentStream).toHaveBeenCalledTimes(2);
      expect(chunks[1].foods).toHaveLength(0);
      expect(chunks[2].foods).toHaveLength(6);
      expect(chunks[2].honorableMentions).toHaveLength(1);
    });

    it('throws a terminal Error when retry attempt also fails validation', async () => {
      const incompleteFoods: CulinaryFoodItem[] = [makeFood('Sushi')];

      mockAiService.generateContentStream
        .mockResolvedValueOnce(
          createMockStream([
            {
              partialData: {
                foods: incompleteFoods,
                honorableMentions: ['Monjayaki'],
              },
            },
          ]),
        )
        .mockResolvedValueOnce(
          createMockStream([
            {
              partialData: {
                foods: incompleteFoods,
                honorableMentions: ['Monjayaki'],
              },
            },
          ]),
        );

      await expect(collectStream(service.getTopFoodsStream(mockLocation))).rejects.toThrow(
        `Incomplete culinary discovery stream: expected ${EXPECTED_FOOD_COUNT} foods and ${MIN_HONORABLE_MENTIONS}-${MAX_HONORABLE_MENTIONS} honorable mentions, but received 1 foods and 1 honorable mentions`,
      );

      expect(mockAiService.generateContentStream).toHaveBeenCalledTimes(2);
    });

    it('propagates upstream errors when generateContentStream rejects', async () => {
      mockAiService.generateContentStream.mockRejectedValue(new Error('AI engine failure'));

      await expect(collectStream(service.getTopFoodsStream(mockLocation))).rejects.toThrow('AI engine failure');
    });
  });

  describe('getRecipeStream', () => {
    it('yields streaming chunks and terminates cleanly when stream passes completion validation', async () => {
      const mockResponse = {
        inferenceSource: 'on_device' as const,
        thoughtSummary: () => 'Synthesizing authentic broth',
      } as EnhancedGenerateContentResponse;

      mockAiService.generateContentStream.mockResolvedValue(
        createMockStream([
          {
            partialData: {
              ingredients: ['Pork bones', 'Ramen noodles'],
            },
          },
          {
            partialData: {
              ingredients: ['Pork bones', 'Ramen noodles', 'Green onions'],
              recipe: '# Tonkotsu Ramen\n\n1. Simmer pork bones for 12 hours.',
            },
            response: mockResponse,
          },
        ]),
      );

      const chunks = await collectStream(service.getRecipeStream(mockTarget));

      expect(mockAiService.generateContentStream).toHaveBeenCalledTimes(1);
      expect(mockAiService.generateContentStream).toHaveBeenCalledWith(
        expect.objectContaining({
          systemInstruction: RECIPE_PROMPT_INSTRUCTION,
          schema: CulinaryRecipeSchema,
        }),
      );

      expect(chunks).toHaveLength(2);
      expect(chunks[0].ingredients).toEqual(['Pork bones', 'Ramen noodles']);
      expect(chunks[0].recipe).toBe('');

      expect(chunks[1].ingredients).toHaveLength(3);
      expect(chunks[1].recipe).toContain('Simmer pork bones');
      expect(chunks[1].thoughtSummary).toBe('Synthesizing authentic broth');
    });

    it('emits reset chunk and retries once when initial attempt yields empty recipe', async () => {
      mockAiService.generateContentStream
        .mockResolvedValueOnce(
          createMockStream([
            {
              partialData: {
                ingredients: ['Pork bones'],
                recipe: '   ',
              },
            },
          ]),
        )
        .mockResolvedValueOnce(
          createMockStream([
            {
              partialData: {
                ingredients: ['Pork bones'],
                recipe: '# Tonkotsu Ramen\n\n1. Cook.',
              },
            },
          ]),
        );

      const chunks = await collectStream(service.getRecipeStream(mockTarget));

      expect(mockAiService.generateContentStream).toHaveBeenCalledTimes(2);
      expect(chunks).toHaveLength(3);
      // Attempt 1:
      expect(chunks[0].recipe).toBe('   ');
      // Reset chunk:
      expect(chunks[1].ingredients).toHaveLength(0);
      expect(chunks[1].recipe).toBe('');
      // Attempt 2:
      expect(chunks[2].recipe).toContain('Cook.');
    });

    it('throws a terminal Error when retry attempt also yields empty recipe or ingredients', async () => {
      mockAiService.generateContentStream
        .mockResolvedValueOnce(
          createMockStream([
            {
              partialData: {
                ingredients: [],
                recipe: '',
              },
            },
          ]),
        )
        .mockResolvedValueOnce(
          createMockStream([
            {
              partialData: {
                ingredients: [],
                recipe: '',
              },
            },
          ]),
        );

      await expect(collectStream(service.getRecipeStream(mockTarget))).rejects.toThrow(
        /Incomplete culinary recipe stream: missing ingredients or recipe text for "Tonkotsu Ramen"/,
      );

      expect(mockAiService.generateContentStream).toHaveBeenCalledTimes(2);
    });

    it('propagates upstream errors when generateContentStream rejects', async () => {
      mockAiService.generateContentStream.mockRejectedValue(new Error('Backend timeout'));

      await expect(collectStream(service.getRecipeStream(mockTarget))).rejects.toThrow('Backend timeout');
    });
  });
});
