import {
  AiService,
  InferenceMetadata,
  TokenModalityBreakdown,
  TokenSummary,
  ZERO_TOKEN_SUMMARY,
} from '@/core/firebase';
import { inject, Service } from '@angular/core';
import type { EnhancedGenerateContentResponse, InferenceSource } from 'firebase/ai';
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
  RECIPE_PROMPT_INSTRUCTION,
} from './culinary-guide.prompt';
import { CulinaryRecipeSchema, TopFoodsSchema } from './culinary-guide.schema';

const MAX_ATTEMPTS = 2;
const EXPECTED_FOOD_COUNT = 6;
const MIN_HONORABLE_MENTIONS = 1;
const MAX_HONORABLE_MENTIONS = 2;

@Service()
export class CulinaryGuideService {
  readonly #aiService = inject(AiService);

  async *getTopFoodsStream(location: CulinaryLocation): AsyncGenerator<StreamingCulinaryDiscoveryWithMetadata> {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      const generator = await this.#aiService.generateContentStream<TopFoodsResponse>({
        systemInstruction: CULINARY_GUIDE_SYSTEM_INSTRUCTION,
        contents: createTopFoodsPrompt(location),
        schema: TopFoodsSchema,
      });

      let latestFoods: CulinaryFoodItem[] = [];
      let latestHonorableMentions: string[] = [];

      for await (const update of generator) {
        const inferenceMetadata = this.buildInferenceMetadata(update.response);
        latestFoods = update.partialData.foods || [];
        latestHonorableMentions = update.partialData.honorableMentions || [];

        yield {
          ...inferenceMetadata,
          foods: latestFoods,
          honorableMentions: latestHonorableMentions,
        };
      }

      const isValid =
        latestFoods.length === EXPECTED_FOOD_COUNT &&
        latestHonorableMentions.length >= MIN_HONORABLE_MENTIONS &&
        latestHonorableMentions.length <= MAX_HONORABLE_MENTIONS;

      if (isValid) {
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
        `Incomplete culinary discovery stream: expected 6 foods and 1-2 honorable mentions, but received ${latestFoods.length} foods and ${latestHonorableMentions.length} honorable mentions.`,
      );
    }
  }

  private buildInferenceMetadata(response: EnhancedGenerateContentResponse | undefined): InferenceMetadata {
    let source: InferenceSource = 'on_device';
    let thoughtSummary = 'No thought summary';
    let tokenSummary: TokenSummary | undefined = undefined;
    let tokenModalityBreakdown: TokenModalityBreakdown | undefined = undefined;
    if (response) {
      source = response.inferenceSource || 'on_device';
      thoughtSummary = response.thoughtSummary() || 'No thought summary';
      const usageGroup = this.#aiService.processUsage(response);
      tokenSummary = usageGroup?.tokenSummary ?? ZERO_TOKEN_SUMMARY;
      tokenModalityBreakdown = usageGroup?.tokenBreakdown;
    }
    return { source, thoughtSummary, tokenSummary, tokenModalityBreakdown };
  }

  async *getRecipeStream(target: CulinaryRecipeTarget): AsyncGenerator<StreamingCulinaryRecipeWithMetadata> {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      const generator = await this.#aiService.generateContentStream<CulinaryRecipeResponse>({
        systemInstruction: RECIPE_PROMPT_INSTRUCTION,
        contents: createRecipePrompt(target),
        schema: CulinaryRecipeSchema,
      });

      let latestIngredients: string[] = [];
      let latestRecipe = '';

      for await (const update of generator) {
        const inferenceMetadata = this.buildInferenceMetadata(update.response);
        latestIngredients = update.partialData.ingredients || [];
        latestRecipe = update.partialData.recipe || '';

        yield {
          ...inferenceMetadata,
          ingredients: latestIngredients,
          recipe: latestRecipe,
        };
      }

      const isValid = latestIngredients.length >= 1 && latestRecipe.trim().length > 0;

      if (isValid) {
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
