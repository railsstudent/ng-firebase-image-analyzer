import { AiService, type PartialResponse } from '@/core/firebase';
import { inject, Service } from '@angular/core';
import { EXPECTED_FOOD_COUNT, MAX_HONORABLE_MENTIONS, MIN_HONORABLE_MENTIONS } from './culinary-guide.const';
import type {
  CulinaryFoodItem,
  CulinaryLocation,
  CulinaryRecipeResponse,
  CulinaryRecipeTarget,
  StreamingCulinaryDiscoveryWithMetadata,
  StreamingCulinaryRecipeWithMetadata,
  TopFoodsResponse,
} from './culinary-guide.interface';
import {
  createRecipePrompt,
  createTopFoodsPrompt,
  CULINARY_GUIDE_SYSTEM_INSTRUCTION,
  RECIPE_SYSTEM_INSTRUCTION,
} from './culinary-guide.prompt';
import { CulinaryRecipeSchema, TopFoodsSchema } from './culinary-guide.schema';
import { isValidDiscoveryResponse, isValidRecipeResponse } from './culinary-guide.validation';
import { normalizeDiscoveryResponse } from './culinary-guide.normalization';

const MAX_ATTEMPTS = 2;

@Service()
export class CulinaryGuideService {
  readonly #aiService = inject(AiService);

  async *getTopFoodsStream(destination: CulinaryLocation): AsyncGenerator<StreamingCulinaryDiscoveryWithMetadata> {
    const prompt = createTopFoodsPrompt(destination);
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      const generator = await this.#aiService.generateContentStream<TopFoodsResponse>({
        systemInstruction: CULINARY_GUIDE_SYSTEM_INSTRUCTION,
        contents: prompt,
        schema: TopFoodsSchema,
      });

      let foods: CulinaryFoodItem[] = [];
      let honorableMentions: string[] = [];

      for await (const update of generator) {
        const chunkData = this.extractChunk(update);
        foods = chunkData.foods;
        honorableMentions = chunkData.honorableMentions;

        yield chunkData;
      }

      if (isValidDiscoveryResponse({ foods, honorableMentions })) {
        return;
      }

      if (attempt === 1) {
        yield {
          source: 'on_device',
          thoughtSummary: '',
          foods: [],
          honorableMentions: [],
        };
        continue;
      }

      throw new Error(
        `Incomplete culinary discovery stream: expected ${EXPECTED_FOOD_COUNT} foods and ${MIN_HONORABLE_MENTIONS}-${MAX_HONORABLE_MENTIONS} honorable mentions, but received ${foods.length} foods and ${honorableMentions.length} honorable mentions.`,
      );
    }
  }

  private extractChunk(update: PartialResponse<TopFoodsResponse>): StreamingCulinaryDiscoveryWithMetadata {
    const inferenceMetadata = update.inferenceMetadata || {
      source: 'on_device',
      displaySource: 'Unknown',
      thoughtSummary: '',
    };
    const { foods, honorableMentions } = normalizeDiscoveryResponse({
      foods: update.partialData.foods || [],
      honorableMentions: update.partialData.honorableMentions || [],
    });
    return { ...inferenceMetadata, foods, honorableMentions };
  }

  async *getRecipeStream(target: CulinaryRecipeTarget): AsyncGenerator<StreamingCulinaryRecipeWithMetadata> {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      const generator = await this.#aiService.generateContentStream<CulinaryRecipeResponse>({
        systemInstruction: RECIPE_SYSTEM_INSTRUCTION,
        contents: createRecipePrompt(target),
        schema: CulinaryRecipeSchema,
      });

      let ingredients: string[] = [];
      let recipe = '';

      for await (const update of generator) {
        const inferenceMetadata = update.inferenceMetadata || {
          source: 'on_device',
          displaySource: 'Unknown',
          thoughtSummary: '',
        };
        ingredients = update.partialData.ingredients || [];
        recipe = update.partialData.recipe || '';

        yield {
          ...inferenceMetadata,
          ingredients,
          recipe,
        };
      }

      if (isValidRecipeResponse({ ingredients, recipe })) {
        return;
      }

      if (attempt === 1) {
        yield {
          source: 'on_device',
          thoughtSummary: '',
          ingredients: [],
          recipe: '',
        };
        continue;
      }

      throw new Error(
        `Incomplete culinary recipe stream: missing ingredients or recipe text for "${target.dishName}".`,
      );
    }
  }
}
