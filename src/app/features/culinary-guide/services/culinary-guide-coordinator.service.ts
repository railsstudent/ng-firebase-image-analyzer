import {
  CulinaryGuideService,
  CulinaryLocation,
  CulinaryRecipeTarget,
  MarkdownFormatterService,
  StreamingCulinaryDiscoveryWithMetadata,
  StreamingCulinaryRecipeWithMetadata,
} from '@/core/culinary-guide';
import { CulinaryRecipeDetail } from '@/features/culinary-guide/interfaces/culinary-recipe-detail.interface';
import { inject, Service } from '@angular/core';

@Service()
export class CulinaryGuideStateService {
  readonly #culinaryService = inject(CulinaryGuideService);
  readonly #markdownFormatter = inject(MarkdownFormatterService);

  readonly #recipeCache = new Map<string, CulinaryRecipeDetail>();

  private buildRecipeCacheKey({ country, city, dishName }: CulinaryRecipeTarget): string {
    return `${country.trim()}:${city.trim()}:${dishName}`;
  }

  async *search(destination: CulinaryLocation): AsyncGenerator<StreamingCulinaryDiscoveryWithMetadata> {
    try {
      const generator = this.#culinaryService.getTopFoodsStream(destination);

      for await (const chunk of generator) {
        yield chunk;
      }

      // successful search, clear cache
      this.clearCache();
    } catch (err) {
      console.error(err);
      throw new Error('Error in generating top foods and honorable mentions', { cause: err });
    }
  }

  async *load(target: CulinaryRecipeTarget): AsyncGenerator<CulinaryRecipeDetail> {
    try {
      const key = this.buildRecipeCacheKey(target);
      const cachedRecipe = this.#recipeCache.get(key);
      if (cachedRecipe) {
        yield cachedRecipe;
      }

      const generator = this.#culinaryService.getRecipeStream(target);
      let recipeDetail: StreamingCulinaryRecipeWithMetadata | undefined = undefined;
      for await (const chunk of generator) {
        recipeDetail = chunk;
        yield {
          ...chunk,
          recipeHtml: '',
        };
      }

      if (recipeDetail) {
        const recipeHtml = await this.#markdownFormatter.format(recipeDetail.recipe);
        const successfulRecipe = {
          ...recipeDetail,
          recipeHtml,
        };
        this.#recipeCache.set(key, successfulRecipe);
        yield successfulRecipe;
      }
    } catch (err) {
      console.error(err);
      throw new Error('Error in generating ingredients and recipe', { cause: err });
    }
  }

  clearCache(): void {
    this.#recipeCache.clear();
  }
}
