import { Schema } from 'firebase/ai';

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
  minItems: 6,
  maxItems: 6,
  description: 'Top 6 foods for the selected country and city.',
});

const HonorableMentionsSchema = Schema.array({
  items: Schema.string({
    description: 'A dish that does not make into the top foods.',
  }),
  minItems: 1,
  maxItems: 2,
  description: 'Between 1 and 2 honorable mention runner-up dishes.',
});

export const TopFoodsSchema = Schema.object({
  properties: {
    foods: FoodsSchema,
    honorableMentions: HonorableMentionsSchema,
  },
  description: 'Structured output foods and honorable mentions.',
});

export const RecipeDetailSchema = Schema.object({
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
