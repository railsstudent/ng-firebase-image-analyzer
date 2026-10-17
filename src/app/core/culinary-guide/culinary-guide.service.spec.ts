import { AiService } from '@/core/firebase';
import { collectStream, createMockStream } from '@/testing/ai-stream.mock';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
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
  };

  const mockLocation: CulinaryLocation = { country: 'Japan', city: 'Tokyo' };
  const mockTarget: CulinaryRecipeTarget = { country: 'Japan', city: 'Tokyo', dishName: 'Tonkotsu Ramen' };

  beforeEach(() => {
    mockAiService = {
      generateContentStream: vi.fn(),
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
      const mockMetadata = {
        source: 'on_device' as const,
        thoughtSummary: 'Curated 6 iconic Tokyo dishes',
        tokenSummary: {
          promptTokenCount: 10,
          outputTokenCount: 20,
          totalTokenCount: 30,
          thoughtsTokenCount: 0,
          cachedContentTokenCount: 0,
        },
      };

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
            inferenceMetadata: mockMetadata,
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
      expect(chunks[0].thoughtSummary).toBe('');

      expect(chunks[1].foods).toHaveLength(6);
      expect(chunks[1].honorableMentions).toEqual(['Monjayaki']);
      expect(chunks[1].thoughtSummary).toBe('Curated 6 iconic Tokyo dishes');
      expect(chunks[1].tokenSummary).toEqual({
        promptTokenCount: 10,
        outputTokenCount: 20,
        totalTokenCount: 30,
        thoughtsTokenCount: 0,
        cachedContentTokenCount: 0,
      });
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

    it('yields normalized chunks progressively during streaming to prevent duplicate keys in UI', async () => {
      const duplicateBatch: CulinaryFoodItem[] = [makeFood('Tacos'), makeFood('Burrito'), makeFood('tacos')];

      mockAiService.generateContentStream.mockResolvedValue(
        createMockStream([
          {
            partialData: {
              foods: duplicateBatch,
              honorableMentions: ['Tacos', 'Guacamole', 'guacamole'],
            },
          },
          {
            partialData: {
              foods: [
                ...duplicateBatch,
                makeFood('Enchiladas'),
                makeFood('Tamales'),
                makeFood('Quesadilla'),
                makeFood('Fajitas'),
              ],
              honorableMentions: ['Tacos', 'Guacamole', 'guacamole'],
            },
          },
        ]),
      );

      const chunks = await collectStream(service.getTopFoodsStream(mockLocation));

      // In the first intermediate chunk:
      // Foods: deduplicates 'Tacos' and 'tacos' -> 2 items ('Tacos', 'Burrito')
      expect(chunks[0].foods).toHaveLength(2);
      expect(chunks[0].foods[0].name).toBe('Tacos');
      expect(chunks[0].foods[1].name).toBe('Burrito');
      // Mentions: 'Tacos' excluded (collides with foods), 'guacamole' deduplicated -> ['Guacamole']
      expect(chunks[0].honorableMentions).toEqual(['Guacamole']);

      // In the terminal chunk: 6 unique foods, 1 honorable mention
      expect(chunks[1].foods).toHaveLength(6);
      expect(chunks[1].honorableMentions).toEqual(['Guacamole']);
    });

    it('emits reset chunk and retries when attempt 1 produces duplicate foods reducing unique count below 6', async () => {
      const duplicateFoodsAttempt1: CulinaryFoodItem[] = [
        makeFood('Ramen'),
        makeFood('ramen'),
        makeFood('Sushi'),
        makeFood('Tempura'),
        makeFood('Udon'),
        makeFood('Soba'),
      ];

      const validFoodsAttempt2: CulinaryFoodItem[] = [
        makeFood('Ramen'),
        makeFood('Yakitori'),
        makeFood('Sushi'),
        makeFood('Tempura'),
        makeFood('Udon'),
        makeFood('Soba'),
      ];

      mockAiService.generateContentStream
        .mockResolvedValueOnce(
          createMockStream([
            {
              partialData: {
                foods: duplicateFoodsAttempt1,
                honorableMentions: ['Takoyaki'],
              },
            },
          ]),
        )
        .mockResolvedValueOnce(
          createMockStream([
            {
              partialData: {
                foods: validFoodsAttempt2,
                honorableMentions: ['Takoyaki'],
              },
            },
          ]),
        );

      const chunks = await collectStream(service.getTopFoodsStream(mockLocation));

      expect(mockAiService.generateContentStream).toHaveBeenCalledTimes(2);
      // Attempt 1 emitted deduplicated chunk (5 unique foods)
      expect(chunks[0].foods).toHaveLength(5);
      // Reset chunk emitted
      expect(chunks[1].foods).toHaveLength(0);
      expect(chunks[1].honorableMentions).toHaveLength(0);
      // Attempt 2 succeeded with 6 foods
      expect(chunks[2].foods).toHaveLength(6);
    });

    it('completes on attempt 1 without retry when duplicate mentions normalize to an acceptable count (1)', async () => {
      const sixFoods: CulinaryFoodItem[] = [
        makeFood('Sushi'),
        makeFood('Ramen'),
        makeFood('Tempura'),
        makeFood('Soba'),
        makeFood('Yakitori'),
        makeFood('Tonkatsu'),
      ];

      mockAiService.generateContentStream.mockResolvedValue(
        createMockStream([
          {
            partialData: {
              foods: sixFoods,
              honorableMentions: ['Takoyaki', 'takoyaki'],
            },
          },
        ]),
      );

      const chunks = await collectStream(service.getTopFoodsStream(mockLocation));

      expect(mockAiService.generateContentStream).toHaveBeenCalledTimes(1);
      expect(chunks[0].foods).toHaveLength(6);
      expect(chunks[0].honorableMentions).toEqual(['Takoyaki']);
    });

    it('emits reset chunk and retries when honorable mentions collide with foods and starve mentions count to 0', async () => {
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
                honorableMentions: ['Sushi', 'ramen'],
              },
            },
          ]),
        )
        .mockResolvedValueOnce(
          createMockStream([
            {
              partialData: {
                foods: sixFoods,
                honorableMentions: ['Takoyaki'],
              },
            },
          ]),
        );

      const chunks = await collectStream(service.getTopFoodsStream(mockLocation));

      expect(mockAiService.generateContentStream).toHaveBeenCalledTimes(2);
      // Attempt 1: mentions were dropped due to collision with foods, yielding 0 mentions
      expect(chunks[0].honorableMentions).toHaveLength(0);
      // Reset chunk emitted
      expect(chunks[1].foods).toHaveLength(0);
      // Attempt 2 succeeded with 1 mention
      expect(chunks[2].honorableMentions).toEqual(['Takoyaki']);
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
      const mockMetadata = {
        source: 'on_device' as const,
        thoughtSummary: 'Synthesizing authentic broth',
      };

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
            inferenceMetadata: mockMetadata,
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
      expect(chunks[0].thoughtSummary).toBe('');

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
