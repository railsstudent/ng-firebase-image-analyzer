import { AiService, InferenceMetadata, TokenModalityBreakdown, TokenSummary, ZERO_TOKEN_SUMMARY } from '@/core/firebase';
import { inject, Service } from '@angular/core';
import type { EnhancedGenerateContentResponse, InferenceSource } from 'firebase/ai';
import type { CulinaryLocation, CulinaryRecipeResponse, CulinaryRecipeTarget, StreamingCulinaryDiscoveryWithMetadata, StreamingCulinaryRecipeWithMetadata, TopFoodsResponse } from './culinary-guide.interface';
import { createRecipePrompt, createTopFoodsPrompt, CULINARY_GUIDE_SYSTEM_INSTRUCTION, RECIPE_PROMPT_INSTRUCTION } from './culinary-guide.prompt';
import { CulinaryRecipeSchema, TopFoodsSchema } from './culinary-guide.schema';

@Service()
export class CulinaryGuideService {
  readonly #aiService = inject(AiService);

  async *getTopFoodsStream(location: CulinaryLocation): AsyncGenerator<StreamingCulinaryDiscoveryWithMetadata> {
    const generator = await this.#aiService.generateContentStream<TopFoodsResponse>({
      systemInstruction: CULINARY_GUIDE_SYSTEM_INSTRUCTION,
      contents: createTopFoodsPrompt(location),
      schema: TopFoodsSchema,
    });

    for await (const update of generator) {
      const inferenceMetadata = this.buildInferenceMetadata(update.response);

      yield {
        ...inferenceMetadata,
        foods: update.partialData.foods || [],
        honorableMentions: update.partialData.honorableMentions || [],
      };
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
    const generator = await this.#aiService.generateContentStream<CulinaryRecipeResponse>({
      systemInstruction: RECIPE_PROMPT_INSTRUCTION,
      contents: createRecipePrompt(target),
      schema: CulinaryRecipeSchema,
    });

    for await (const update of generator) {
      const inferenceMetadata = this.buildInferenceMetadata(update.response);

      yield {
        ...inferenceMetadata,
        ingredients: update.partialData.ingredients || [],
        recipe: update.partialData.recipe || '',
      };
    }
  }
}
