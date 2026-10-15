import { Schema } from 'firebase/ai';
import { EXPECTED_FOOD_COUNT, MAX_HONORABLE_MENTIONS, MIN_HONORABLE_MENTIONS } from './culinary-guide.const';

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
        description: 'Ingredient of a dish with recommended quantity and notes.',
      }),
      description: 'At least one ingredient of a dish.',
      minItems: 1,
    }),
    recipe: Schema.string({
      description: 'Recipe in Markdown format with numbered steps and bulleted lists.',
    }),
  },
  description: 'Structured output of ingredients and recipe.',
});
