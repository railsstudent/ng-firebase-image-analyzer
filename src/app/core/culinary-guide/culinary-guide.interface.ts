import type { InferenceMetadata } from '@/core/firebase';

export interface CulinaryDestination {
  readonly country: string;
  readonly cities: readonly string[];
}

export interface DestinationDataset {
  readonly data: readonly CulinaryDestination[];
}

export interface CulinaryLocation {
  country: string;
  city: string;
}

export interface MarkdownModules {
  snarkdown: (markdown: string) => string;
  dompurify: {
    sanitize: (html: string) => string;
  };
}

export interface CulinaryFoodItem {
  name: string;
  nativeName?: string;
  description: string;
}

export interface TopFoodsResponse {
  foods: CulinaryFoodItem[];
  honorableMentions: string[];
}

export interface StreamingCulinaryDiscoveryWithMetadata extends TopFoodsResponse, InferenceMetadata {}

export interface CulinaryRecipeResponse {
  ingredients: string[];
  recipe: string;
}

export interface StreamingCulinaryRecipeWithMetadata extends CulinaryRecipeResponse, InferenceMetadata {}

export interface CulinaryLocation {
  country: string;
  city: string;
}

export interface CulinaryRecipeTarget extends CulinaryLocation {
  dishName: string;
}
