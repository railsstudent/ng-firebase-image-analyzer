import {
  type CulinaryLocation,
  type CulinaryRecipeTarget,
  type StreamingCulinaryDiscoveryWithMetadata,
  type StreamingCulinaryRecipeWithMetadata,
} from '@/core/culinary-guide';
import { collectStream } from '@/testing/ai-stream.mock';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CulinaryGuideCoordinatorService } from './culinary-guide-coordinator.service';
import { CulinaryGuideService } from '@/core/culinary-guide/culinary-guide.service';
import { MarkdownFormatterService } from '@/core/culinary-guide/markdown-formatter.service';

async function* toAsyncStream<T>(items: readonly T[]): AsyncGenerator<T> {
  for (const item of items) {
    yield item;
  }
}

describe('CulinaryGuideCoordinatorService', () => {
  let coordinator: CulinaryGuideCoordinatorService;
  let mockCulinaryService: {
    getTopFoodsStream: ReturnType<typeof vi.fn>;
    getRecipeStream: ReturnType<typeof vi.fn>;
  };
  let mockMarkdownFormatter: {
    format: ReturnType<typeof vi.fn>;
  };

  const mockLocation: CulinaryLocation = { country: 'Japan', city: 'Tokyo' };
  const mockTarget: CulinaryRecipeTarget = { country: 'Japan', city: 'Tokyo', dishName: 'Tonkotsu Ramen' };

  beforeEach(() => {
    mockCulinaryService = {
      getTopFoodsStream: vi.fn(),
      getRecipeStream: vi.fn(),
    } satisfies Partial<CulinaryGuideService>;
    mockMarkdownFormatter = {
      format: vi.fn().mockResolvedValue('<p>Cook the broth for 12 hours.</p>'),
    } satisfies Partial<MarkdownFormatterService>;

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        CulinaryGuideCoordinatorService,
        { provide: CulinaryGuideService, useValue: mockCulinaryService },
        { provide: MarkdownFormatterService, useValue: mockMarkdownFormatter },
      ],
    });

    coordinator = TestBed.inject(CulinaryGuideCoordinatorService);
  });

  describe('search', () => {
    it('yields discovery chunks progressively and clears recipe cache on completion', async () => {
      // Prime the cache first by loading a recipe
      const recipeChunks: StreamingCulinaryRecipeWithMetadata[] = [
        {
          source: 'on_device',
          thoughtSummary: '',
          ingredients: ['Pork bones', 'Noodles'],
          recipe: 'Cook broth.',
        },
      ];
      mockCulinaryService.getRecipeStream.mockReturnValue(toAsyncStream(recipeChunks));
      await collectStream(coordinator.loadRecipe(mockTarget));

      // Assert cache is populated
      mockCulinaryService.getRecipeStream.mockClear();
      const cachedResult = await collectStream(coordinator.loadRecipe(mockTarget));
      expect(mockCulinaryService.getRecipeStream).not.toHaveBeenCalled();
      expect(cachedResult).toHaveLength(1);

      // Now run search
      const discoveryChunks: StreamingCulinaryDiscoveryWithMetadata[] = [
        {
          source: 'on_device',
          thoughtSummary: 'Curating Tokyo dishes',
          foods: [{ name: 'Sushi', description: 'Fresh raw fish' }],
          honorableMentions: [],
        },
        {
          source: 'on_device',
          thoughtSummary: 'Curating Tokyo dishes',
          foods: [
            { name: 'Sushi', description: 'Fresh raw fish' },
            { name: 'Ramen', description: 'Rich noodle broth' },
          ],
          honorableMentions: ['Yakitori'],
        },
      ];
      mockCulinaryService.getTopFoodsStream.mockReturnValue(toAsyncStream(discoveryChunks));

      const searchEmissions = await collectStream(coordinator.search(mockLocation));
      expect(searchEmissions).toHaveLength(2);
      expect(searchEmissions[0].foods).toHaveLength(1);
      expect(searchEmissions[1].foods).toHaveLength(2);
      expect(mockCulinaryService.getTopFoodsStream).toHaveBeenCalledWith(mockLocation);

      // Verify cache was cleared upon successful search completion
      await collectStream(coordinator.loadRecipe(mockTarget));
      expect(mockCulinaryService.getRecipeStream).toHaveBeenCalledTimes(1);
    });

    it('masks retry reset chunks (empty foods) if items have already been yielded', async () => {
      const discoveryChunksWithReset: StreamingCulinaryDiscoveryWithMetadata[] = [
        {
          source: 'on_device',
          thoughtSummary: 'Attempt 1',
          foods: [{ name: 'Sushi', description: 'Fresh raw fish' }],
          honorableMentions: [],
        },
        // Reset chunk emitted on retry
        {
          source: 'on_device',
          thoughtSummary: 'Attempt 1 reset',
          foods: [],
          honorableMentions: [],
        },
        // Retry attempt 2 emissions
        {
          source: 'on_device',
          thoughtSummary: 'Attempt 2',
          foods: [
            { name: 'Sushi', description: 'Fresh raw fish' },
            { name: 'Ramen', description: 'Rich noodle broth' },
          ],
          honorableMentions: ['Yakitori'],
        },
      ];
      mockCulinaryService.getTopFoodsStream.mockReturnValue(toAsyncStream(discoveryChunksWithReset));

      const searchEmissions = await collectStream(coordinator.search(mockLocation));
      expect(searchEmissions).toHaveLength(2);
      expect(searchEmissions[0].foods).toHaveLength(1);
      expect(searchEmissions[1].foods).toHaveLength(2);
    });

    it('yields initial empty foods chunk if no foods have been yielded yet', async () => {
      const discoveryChunksStartingEmpty: StreamingCulinaryDiscoveryWithMetadata[] = [
        {
          source: 'on_device',
          thoughtSummary: 'Starting search',
          foods: [],
          honorableMentions: [],
        },
        {
          source: 'on_device',
          thoughtSummary: 'First food found',
          foods: [{ name: 'Sushi', description: 'Fresh raw fish' }],
          honorableMentions: [],
        },
      ];
      mockCulinaryService.getTopFoodsStream.mockReturnValue(toAsyncStream(discoveryChunksStartingEmpty));

      const searchEmissions = await collectStream(coordinator.search(mockLocation));
      expect(searchEmissions).toHaveLength(2);
      expect(searchEmissions[0].foods).toHaveLength(0);
      expect(searchEmissions[1].foods).toHaveLength(1);
    });

    it('propagates search errors and preserves existing cache when search fails', async () => {
      // Prime cache
      const recipeChunks: StreamingCulinaryRecipeWithMetadata[] = [
        {
          source: 'on_device',
          thoughtSummary: '',
          ingredients: ['Pork bones'],
          recipe: 'Boil bones.',
        },
      ];
      mockCulinaryService.getRecipeStream.mockReturnValue(toAsyncStream(recipeChunks));
      await collectStream(coordinator.loadRecipe(mockTarget));

      // Search throws error
      async function* failingGenerator(): AsyncGenerator<StreamingCulinaryDiscoveryWithMetadata> {
        yield {
          source: 'on_device',
          thoughtSummary: 'Attempting search',
          foods: [{ name: 'Sushi', description: 'Fresh raw fish' }],
          honorableMentions: [],
        };
        throw new Error('On-device inference aborted');
      }
      mockCulinaryService.getTopFoodsStream.mockReturnValue(failingGenerator());

      const searchErrorPromise = collectStream(coordinator.search(mockLocation));
      await expect(searchErrorPromise).rejects.toThrow('Error in generating top foods and honorable mentions');
      await expect(searchErrorPromise).rejects.toMatchObject({
        cause: expect.objectContaining({ message: 'On-device inference aborted' }),
      });

      // Verify recipe cache was preserved
      mockCulinaryService.getRecipeStream.mockClear();
      const cachedResult = await collectStream(coordinator.loadRecipe(mockTarget));
      expect(mockCulinaryService.getRecipeStream).not.toHaveBeenCalled();
      expect(cachedResult).toHaveLength(1);
    });
  });

  describe('loadRecipe', () => {
    it('yields intermediate chunks with empty recipeHtml and defers markdown formatting to the final chunk', async () => {
      const recipeChunks: StreamingCulinaryRecipeWithMetadata[] = [
        {
          source: 'on_device',
          thoughtSummary: 'Generating ingredients',
          ingredients: ['Pork bones', 'Garlic'],
          recipe: '',
        },
        {
          source: 'on_device',
          thoughtSummary: 'Generating instructions',
          ingredients: ['Pork bones', 'Garlic', 'Ramen noodles'],
          recipe: '1. Simmer pork bones for 12 hours.\n2. Boil noodles.',
        },
      ];
      mockCulinaryService.getRecipeStream.mockReturnValue(toAsyncStream(recipeChunks));

      const emissions = await collectStream(coordinator.loadRecipe(mockTarget));

      // Intermediate chunk 1: ingredients emitted, recipeHtml empty
      expect(emissions[0].ingredients).toEqual(['Pork bones', 'Garlic']);
      expect(emissions[0].recipeHtml).toBe('');

      // Intermediate chunk 2: updated ingredients, recipeHtml empty
      expect(emissions[1].ingredients).toEqual(['Pork bones', 'Garlic', 'Ramen noodles']);
      expect(emissions[1].recipeHtml).toBe('');

      // Final chunk: formatted HTML present, identical to last chunk data
      expect(emissions[2].ingredients).toEqual(['Pork bones', 'Garlic', 'Ramen noodles']);
      expect(emissions[2].recipeHtml).toBe('<p>Cook the broth for 12 hours.</p>');

      // Formatter should only have been called once on completion
      expect(mockMarkdownFormatter.format).toHaveBeenCalledTimes(1);
      expect(mockMarkdownFormatter.format).toHaveBeenCalledWith('1. Simmer pork bones for 12 hours.\n2. Boil noodles.');
    });

    it('masks retry reset chunks (empty ingredients) if ingredients have already been yielded', async () => {
      const recipeChunksWithReset: StreamingCulinaryRecipeWithMetadata[] = [
        {
          source: 'on_device',
          thoughtSummary: 'Attempt 1',
          ingredients: ['Pork bones'],
          recipe: '',
        },
        // Reset chunk emitted on retry
        {
          source: 'on_device',
          thoughtSummary: 'Attempt 1 reset',
          ingredients: [],
          recipe: '',
        },
        // Attempt 2 continuation
        {
          source: 'on_device',
          thoughtSummary: 'Attempt 2',
          ingredients: ['Pork bones', 'Noodles'],
          recipe: 'Cook well.',
        },
      ];
      mockCulinaryService.getRecipeStream.mockReturnValue(toAsyncStream(recipeChunksWithReset));

      const emissions = await collectStream(coordinator.loadRecipe(mockTarget));

      // 2 intermediate emissions (masked the reset) + 1 final formatted emission = 3 total
      expect(emissions).toHaveLength(3);
      expect(emissions[0].ingredients).toEqual(['Pork bones']);
      expect(emissions[0].recipeHtml).toBe('');
      expect(emissions[1].ingredients).toEqual(['Pork bones', 'Noodles']);
      expect(emissions[1].recipeHtml).toBe('');
      expect(emissions[2].recipeHtml).toBe('<p>Cook the broth for 12 hours.</p>');
    });

    it('returns cached recipe in a single emission on cache hit and normalizes cache key case/trimming', async () => {
      const recipeChunks: StreamingCulinaryRecipeWithMetadata[] = [
        {
          source: 'on_device',
          thoughtSummary: '',
          ingredients: ['Pork bones'],
          recipe: 'Cook broth.',
        },
      ];
      mockCulinaryService.getRecipeStream.mockReturnValue(toAsyncStream(recipeChunks));

      // Initial load (populates cache)
      await collectStream(coordinator.loadRecipe(mockTarget));
      expect(mockCulinaryService.getRecipeStream).toHaveBeenCalledTimes(1);

      // Second load with varied casing and extra whitespace
      mockCulinaryService.getRecipeStream.mockClear();
      mockMarkdownFormatter.format.mockClear();

      const messyTarget: CulinaryRecipeTarget = {
        country: '  JAPAN  ',
        city: '  Tokyo ',
        dishName: ' tonkotsu ramen  ',
      };

      const cachedEmissions = await collectStream(coordinator.loadRecipe(messyTarget));

      expect(mockCulinaryService.getRecipeStream).not.toHaveBeenCalled();
      expect(mockMarkdownFormatter.format).not.toHaveBeenCalled();
      expect(cachedEmissions).toHaveLength(1);
      expect(cachedEmissions[0].recipeHtml).toBe('<p>Cook the broth for 12 hours.</p>');
      expect(cachedEmissions[0].ingredients).toEqual(['Pork bones']);
    });

    it('propagates recipe streaming errors to caller without caching incomplete state', async () => {
      async function* failingRecipeGenerator(): AsyncGenerator<StreamingCulinaryRecipeWithMetadata> {
        yield {
          source: 'on_device',
          thoughtSummary: 'Streaming ingredients',
          ingredients: ['Pork bones'],
          recipe: '',
        };
        throw new Error('Candidate output truncated');
      }
      mockCulinaryService.getRecipeStream.mockReturnValue(failingRecipeGenerator());

      const recipeErrorPromise = collectStream(coordinator.loadRecipe(mockTarget));
      await expect(recipeErrorPromise).rejects.toThrow('Error in generating ingredients and recipe');
      await expect(recipeErrorPromise).rejects.toMatchObject({
        cause: expect.objectContaining({ message: 'Candidate output truncated' }),
      });

      // Ensure cache is not poisoned with the failed attempt
      mockCulinaryService.getRecipeStream.mockClear();
      mockCulinaryService.getRecipeStream.mockReturnValue(
        toAsyncStream([
          {
            source: 'on_device',
            thoughtSummary: '',
            ingredients: ['Pork bones', 'Chashu'],
            recipe: 'Simmer.',
          },
        ]),
      );

      const recoveredEmissions = await collectStream(coordinator.loadRecipe(mockTarget));
      expect(mockCulinaryService.getRecipeStream).toHaveBeenCalledTimes(1);
      expect(recoveredEmissions).toHaveLength(2);
    });
  });

  describe('clearCache', () => {
    it('manually clears in-memory recipe cache', async () => {
      const recipeChunks: StreamingCulinaryRecipeWithMetadata[] = [
        {
          source: 'on_device',
          thoughtSummary: '',
          ingredients: ['Pork bones'],
          recipe: 'Cook broth.',
        },
      ];
      mockCulinaryService.getRecipeStream.mockReturnValue(toAsyncStream(recipeChunks));

      await collectStream(coordinator.loadRecipe(mockTarget));

      // Manually clear cache
      coordinator.clearCache();

      // Next load must hit the service again
      mockCulinaryService.getRecipeStream.mockClear();
      mockCulinaryService.getRecipeStream.mockReturnValue(toAsyncStream(recipeChunks));

      await collectStream(coordinator.loadRecipe(mockTarget));
      expect(mockCulinaryService.getRecipeStream).toHaveBeenCalledTimes(1);
    });
  });
});
