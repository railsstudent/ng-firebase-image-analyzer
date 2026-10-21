import { Schema } from 'firebase/ai';
import {
  EXPECTED_FOOD_COUNT,
  MAX_HONORABLE_MENTIONS,
  MAX_RECIPE_INGREDIENTS,
  MAX_RECIPE_STEPS,
  MIN_HONORABLE_MENTIONS,
  MIN_RECIPE_STEPS,
} from './culinary-guide.const';

const FoodItemSchema = Schema.object({
  properties: {
    name: Schema.string({
      description: 'A dish name.',
    }),
    nativeName: Schema.string({
      description: 'The native name of a dish.',
    }),
    description: Schema.string({
      description: 'The description of a dish.',
    }),
  },
  optionalProperties: ['nativeName'],
  description: 'An iconic local food dish.',
});

const FoodsSchema = Schema.array({
  items: FoodItemSchema,
  minItems: EXPECTED_FOOD_COUNT,
  maxItems: EXPECTED_FOOD_COUNT,
  description: `Top ${EXPECTED_FOOD_COUNT} foods for the selected country and city.`,
});

const HonorableMentionsSchema = Schema.array({
  items: Schema.string({
    description: 'A dish that does not make into the top foods.',
  }),
  minItems: MIN_HONORABLE_MENTIONS,
  maxItems: MAX_HONORABLE_MENTIONS,
  description: `Between ${MIN_HONORABLE_MENTIONS} and ${MAX_HONORABLE_MENTIONS} honorable mention runner-up dishes.`,
});

export const TopFoodsSchema = Schema.object({
  properties: {
    foods: FoodsSchema,
    honorableMentions: HonorableMentionsSchema,
  },
  description: 'Structured output foods and honorable mentions.',
});

export const CulinaryRecipeSchema = Schema.object({
  properties: {
    ingredients: Schema.array({
      items: Schema.string({
        description: 'Core ingredient of a dish with recommended quantity.',
      }),
      description: `Between 1 and ${MAX_RECIPE_INGREDIENTS} core ingredients of a dish.`,
      minItems: 1,
      maxItems: MAX_RECIPE_INGREDIENTS,
    }),
    recipe: Schema.string({
      description: `Concise step-by-step preparation and cooking instructions (${MIN_RECIPE_STEPS} to ${MAX_RECIPE_STEPS} numbered steps) in Markdown format, excluding the ingredients list.`,
    }),
  },
  description: 'Structured output of ingredients and recipe.',
});
