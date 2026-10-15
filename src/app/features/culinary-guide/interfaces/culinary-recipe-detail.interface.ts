import type { StreamingCulinaryRecipeWithMetadata } from '@/core/culinary-guide';

export interface CulinaryRecipeDetail extends StreamingCulinaryRecipeWithMetadata {
  recipeHtml: string;
}
