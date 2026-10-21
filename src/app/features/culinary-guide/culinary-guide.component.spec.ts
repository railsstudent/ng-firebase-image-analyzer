import type {
  CulinaryLocation,
  CulinaryRecipeTarget,
  StreamingCulinaryDiscoveryWithMetadata,
} from '@/core/culinary-guide';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DEFAULT_DISCOVERY_DATA, DEFAULT_RECIPE_DATA } from './constants/culinary-guide.const';
import CulinaryGuideComponent from './culinary-guide.component';
import type { CulinaryRecipeDetail } from './interfaces/culinary-recipe-detail.interface';
import { CulinaryGuideCoordinatorService } from './services/culinary-guide-coordinator.service';

describe('CulinaryGuideComponent', () => {
  let component: CulinaryGuideComponent;
  let fixture: ComponentFixture<CulinaryGuideComponent>;

  let mockCoordinatorService: Partial<CulinaryGuideCoordinatorService>;

  const mockLocation: CulinaryLocation = {
    country: 'Japan',
    city: 'Tokyo',
  };

  const createMockDiscoveryChunk = (foodCount = 1): StreamingCulinaryDiscoveryWithMetadata => ({
    foods: Array.from({ length: foodCount }, (_, i) => ({
      name: `Dish ${i + 1}`,
      nativeName: `Native ${i + 1}`,
      description: `Description ${i + 1}`,
    })),
    thoughtSummary: 'Test reasoning',
    honorableMentions: ['Honorable Mention 1'],
    tokenSummary: {
      totalTokenCount: 100,
      promptTokenCount: 50,
      thoughtsTokenCount: 20,
      cachedContentTokenCount: 0,
      outputTokenCount: 30,
    },
    tokenModalityBreakdown: {
      promptTokensDetails: [{ modality: 'TEXT', tokenCount: 50 }],
      outputTokensDetails: [{ modality: 'TEXT', tokenCount: 30 }],
      cacheTokensDetails: [],
    },
  });

  const createMockRecipeChunk = (recipeHtml = '<p>Recipe content</p>'): CulinaryRecipeDetail => ({
    ingredients: ['Noodles', 'Broth'],
    recipe: 'Cook noodles in broth.',
    recipeHtml,
    thoughtSummary: 'Recipe thought',
    displaySource: 'Cloud AI',
    source: 'on_device',
    tokenSummary: {
      totalTokenCount: 200,
      promptTokenCount: 80,
      thoughtsTokenCount: 40,
      cachedContentTokenCount: 0,
      outputTokenCount: 80,
    },
    tokenModalityBreakdown: {
      promptTokensDetails: [{ modality: 'TEXT', tokenCount: 80 }],
      outputTokensDetails: [{ modality: 'TEXT', tokenCount: 80 }],
      cacheTokensDetails: [],
    },
  });

  beforeEach(async () => {
    mockCoordinatorService = {
      search: vi.fn().mockReturnValue({
        async *[Symbol.asyncIterator]() {
          yield createMockDiscoveryChunk(2);
        },
      }),
      loadRecipe: vi.fn().mockReturnValue({
        async *[Symbol.asyncIterator]() {
          yield createMockRecipeChunk('Ramen');
        },
      }),
    } satisfies Partial<CulinaryGuideCoordinatorService>;

    await TestBed.configureTestingModule({
      imports: [CulinaryGuideComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: CulinaryGuideCoordinatorService,
          useValue: mockCoordinatorService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CulinaryGuideComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create and initialize default signals', () => {
    expect(component).toBeTruthy();
    expect(component.discoveryData()).toBeNull();
    expect(component.expandedDishNames()).toEqual([]);
    expect(component.recipes()).toEqual({});
    expect(component.currentLocation()).toBeUndefined();
    expect(component.isDiscovering()).toBe(false);
    expect(component.dishes()).toEqual([]);
  });

  describe('search()', () => {
    it('should stream discovery chunks and update discoveryData', async () => {
      const chunk1 = createMockDiscoveryChunk(1);
      const chunk2 = createMockDiscoveryChunk(3);

      mockCoordinatorService.search = vi.fn().mockReturnValue({
        async *[Symbol.asyncIterator]() {
          yield chunk1;
          yield chunk2;
        },
      });

      await component.search(mockLocation);

      expect(component.currentLocation()).toEqual(mockLocation);
      expect(component.discoveryData()).toEqual(chunk2);
      expect(component.dishes().length).toBe(3);
      expect(component.isDiscovering()).toBe(false);
    });

    it('should toggle isDiscovering to true during search and reset to false in finally', async () => {
      let resolveStream!: () => void;
      const streamDeferred = new Promise<void>((resolve) => {
        resolveStream = resolve;
      });

      mockCoordinatorService.search = vi.fn().mockReturnValue({
        async *[Symbol.asyncIterator]() {
          yield createMockDiscoveryChunk(1);
          await streamDeferred;
        },
      });

      const searchPromise = component.search(mockLocation);
      expect(component.isDiscovering()).toBe(true);

      resolveStream();
      await searchPromise;

      expect(component.isDiscovering()).toBe(false);
    });

    it('should reset expandedDishNames and recipes on the first received chunk', async () => {
      component.expandedDishNames.set(['Sushi']);
      component.recipes.set({ sushi: createMockRecipeChunk('Sushi') });

      const chunk = createMockDiscoveryChunk(2);
      mockCoordinatorService.search = vi.fn().mockReturnValue({
        async *[Symbol.asyncIterator]() {
          yield chunk;
        },
      });

      await component.search(mockLocation);

      expect(component.expandedDishNames()).toEqual([]);
      expect(component.recipes()).toEqual({});
    });

    it('should discard out-of-order chunks from older search calls when a newer search begins (race guard)', async () => {
      let resolveFirstSearch!: () => void;
      const firstSearchWait = new Promise<void>((resolve) => {
        resolveFirstSearch = resolve;
      });

      const olderChunk1 = createMockDiscoveryChunk(1);
      const olderChunk2 = createMockDiscoveryChunk(2);
      const newerChunk = createMockDiscoveryChunk(5);

      mockCoordinatorService.search = vi
        .fn()
        .mockReturnValueOnce({
          async *[Symbol.asyncIterator]() {
            yield olderChunk1;
            await firstSearchWait;
            yield olderChunk2;
          },
        })
        .mockReturnValueOnce({
          async *[Symbol.asyncIterator]() {
            yield newerChunk;
          },
        });

      // Start first search
      const firstSearchPromise = component.search(mockLocation);

      // Immediately start second search for Kyoto
      const kyotoLocation: CulinaryLocation = { country: 'Japan', city: 'Kyoto' };
      const secondSearchPromise = component.search(kyotoLocation);

      await secondSearchPromise;

      // Resume and complete first search
      resolveFirstSearch();
      await firstSearchPromise;

      // The final state MUST belong to Kyoto (newer search), and olderChunk2 should be discarded
      expect(component.currentLocation()).toEqual(kyotoLocation);
      expect(component.discoveryData()).toEqual(newerChunk);
      expect(component.dishes().length).toBe(5);
    });

    it('should fallback to DEFAULT_DISCOVERY_DATA and set isDiscovering to false on search error', async () => {
      mockCoordinatorService.search = vi.fn().mockReturnValue({
        // eslint-disable-next-line require-yield
        async *[Symbol.asyncIterator]() {
          throw new Error('Network error');
        },
      });

      await component.search(mockLocation);

      expect(component.discoveryData()).toEqual(DEFAULT_DISCOVERY_DATA);
      expect(component.isDiscovering()).toBe(false);
    });
  });

  describe('loadRecipe()', () => {
    it('should do nothing if currentLocation is undefined', async () => {
      component.currentLocation.set(undefined);

      await component.loadRecipe({
        name: 'Tempura',
        nativeName: '天ぷら',
        description: 'Fried seafood',
      });

      expect(mockCoordinatorService.loadRecipe).not.toHaveBeenCalled();
      expect(component.recipes()).toEqual({});
    });

    it('should immediately return and not invoke coordinator if recipe is already cached', async () => {
      component.currentLocation.set(mockLocation);
      const cachedRecipe = createMockRecipeChunk('Tempura');
      component.recipes.set({ tempura: cachedRecipe });

      await component.loadRecipe({
        name: 'Tempura',
        nativeName: '天ぷら',
        description: 'Fried seafood',
      });

      expect(mockCoordinatorService.loadRecipe).not.toHaveBeenCalled();
    });

    it('should stream recipe chunks and update recipes signal with normalized key', async () => {
      component.currentLocation.set(mockLocation);
      const recipeChunk = createMockRecipeChunk('Sushi');

      mockCoordinatorService.loadRecipe = vi.fn().mockReturnValue({
        async *[Symbol.asyncIterator]() {
          yield recipeChunk;
        },
      });

      await component.loadRecipe({
        name: '  Sushi  ',
        nativeName: '寿司',
        description: 'Vinegared rice with fish',
      });

      expect(mockCoordinatorService.loadRecipe).toHaveBeenCalledWith({
        country: 'Japan',
        city: 'Tokyo',
        dishName: '  Sushi  ',
      } satisfies CulinaryRecipeTarget);

      expect(component.recipes()['sushi']).toEqual(recipeChunk);
    });

    it('should fallback to DEFAULT_RECIPE_DATA when loadRecipe throws an error', async () => {
      component.currentLocation.set(mockLocation);

      mockCoordinatorService.loadRecipe = vi.fn().mockReturnValue({
        // eslint-disable-next-line require-yield
        async *[Symbol.asyncIterator]() {
          throw new Error('LLM synthesis failed');
        },
      });

      await component.loadRecipe({
        name: 'Unagi',
        nativeName: '鰻',
        description: 'Grilled freshwater eel',
      });

      expect(component.recipes()['unagi']).toEqual(DEFAULT_RECIPE_DATA);
    });
  });
});
