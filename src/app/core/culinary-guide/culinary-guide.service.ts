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
import { EXPECTED_FOOD_COUNT, MAX_HONORABLE_MENTIONS, MIN_HONORABLE_MENTIONS } from './culinary-guide.const';
import { isValidDiscoveryResponse, isValidRecipeResponse } from './culinary-guide.validation';

const MAX_ATTEMPTS = 2;

@Service()
export class CulinaryGuideService {
  readonly #aiService = inject(AiService);

  async *getTopFoodsStream(destination: CulinaryLocation): AsyncGenerator<StreamingCulinaryDiscoveryWithMetadata> {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      const generator = await this.#aiService.generateContentStream<TopFoodsResponse>({
        systemInstruction: CULINARY_GUIDE_SYSTEM_INSTRUCTION,
        contents: createTopFoodsPrompt(destination),
        schema: TopFoodsSchema,
      });

      let foods: CulinaryFoodItem[] = [];
      let honorableMentions: string[] = [];

      for await (const update of generator) {
        const inferenceMetadata = this.buildInferenceMetadata(update.response);
        foods = update.partialData.foods || [];
        honorableMentions = update.partialData.honorableMentions || [];

        yield {
          ...inferenceMetadata,
          foods,
          honorableMentions,
        };
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

      let ingredients: string[] = [];
      let recipe = '';

      for await (const update of generator) {
        const inferenceMetadata = this.buildInferenceMetadata(update.response);
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
