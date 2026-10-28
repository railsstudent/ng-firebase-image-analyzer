import {
  normalizeKeys,
  type CulinaryLocation,
  type CulinaryRecipeTarget,
  type StreamingCulinaryDiscoveryWithMetadata,
  type StreamingCulinaryRecipeWithMetadata,
} from '@/core/culinary-guide';
import { CulinaryGuideService } from '@/core/culinary-guide/culinary-guide.service';
import { MarkdownFormatterService } from '@/core/culinary-guide/markdown-formatter.service';
import type { CulinaryRecipeDetail } from '@/features/culinary-guide/interfaces/culinary-recipe-detail.interface';
import { inject, Service } from '@angular/core';

@Service()
export class CulinaryGuideCoordinatorService {
  readonly #culinaryService = inject(CulinaryGuideService);
  readonly #markdownFormatter = inject(MarkdownFormatterService);

  readonly #recipeCache = new Map<string, CulinaryRecipeDetail>();

  async *search(location: CulinaryLocation): AsyncGenerator<StreamingCulinaryDiscoveryWithMetadata> {
    try {
      const generator = this.#culinaryService.getTopFoodsStream(location);
      let hasYieldedFoods = false;

      for await (const chunk of generator) {
        if (chunk.foods.length > 0 || !hasYieldedFoods) {
          if (chunk.foods.length > 0) {
            hasYieldedFoods = true;
          }
          yield chunk;
        }
      }

      this.clearCache();
    } catch (err) {
      console.error(err);
      throw new Error('Error in generating top foods and honorable mentions', { cause: err });
    }
  }

  async *loadRecipe(target: CulinaryRecipeTarget): AsyncGenerator<CulinaryRecipeDetail> {
    try {
      const key = normalizeKeys(target.country, target.city, target.dishName);
      const cachedRecipe = this.#recipeCache.get(key);
      if (cachedRecipe) {
        yield cachedRecipe;
        return;
      }

      const generator = this.#culinaryService.getRecipeStream(target);
      let lastChunk: StreamingCulinaryRecipeWithMetadata | undefined;
      let hasYieldedIngredients = false;

      for await (const chunk of generator) {
        if (chunk.ingredients.length > 0 || !hasYieldedIngredients) {
          if (chunk.ingredients.length > 0) {
            hasYieldedIngredients = true;
          }

          lastChunk = chunk;
          yield {
            ...chunk,
            recipeHtml: '',
          };
        }
      }

      if (lastChunk) {
        const recipeHtml = await this.#markdownFormatter.format(lastChunk.recipe);
        const successfulRecipe: CulinaryRecipeDetail = {
          ...lastChunk,
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
