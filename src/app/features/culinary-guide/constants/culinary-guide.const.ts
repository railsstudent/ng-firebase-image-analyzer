import type { StreamingCulinaryDiscoveryWithMetadata } from '@/core/culinary-guide';
import type { CulinaryRecipeDetail } from '@/features/culinary-guide/interfaces/culinary-recipe-detail.interface';

export const DEFAULT_DISCOVERY_DATA: StreamingCulinaryDiscoveryWithMetadata = {
  foods: [],
  honorableMentions: [],
  thoughtSummary: '',
  displaySource: 'Unknown',
  source: 'on_device',
  tokenSummary: {
    totalTokenCount: 0,
    promptTokenCount: 0,
    thoughtsTokenCount: 0,
    cachedContentTokenCount: 0,
    outputTokenCount: 0,
  },
  tokenModalityBreakdown: {
    promptTokensDetails: [],
    outputTokensDetails: [],
    cacheTokensDetails: [],
  },
};

export const DEFAULT_RECIPE_DATA: CulinaryRecipeDetail = {
  ingredients: [],
  recipe: '',
  recipeHtml: '',
  thoughtSummary: '',
  displaySource: 'Unknown',
  source: 'on_device',
  tokenSummary: {
    totalTokenCount: 0,
    promptTokenCount: 0,
    thoughtsTokenCount: 0,
    cachedContentTokenCount: 0,
    outputTokenCount: 0,
  },
  tokenModalityBreakdown: {
    promptTokensDetails: [],
    outputTokensDetails: [],
    cacheTokensDetails: [],
  },
};
