import { Schema } from 'firebase/ai';

const AltTextsSchema = Schema.array({
  items: Schema.string({
    description: 'An alternative text description for the image.',
  }),
  minItems: 1,
  maxItems: 2,
  description: '1 to 2 alternative text options for the image.',
});

const ColorAdjustmentSchema = Schema.object({
  properties: {
    brightness: Schema.number({
      description: 'Brightness adjustment factor (e.g., 1.15 for 15% brighter).',
    }),
    saturation: Schema.number({
      description: 'Saturation adjustment factor (e.g., 0.90 for 10% less saturated).',
    }),
    contrast: Schema.number({
      description: 'Contrast adjustment factor (e.g., 1.05 for 5% more contrast).',
    }),
    warmth: Schema.number({
      description: 'Warmth adjustment factor from 0.0 (neutral) to 1.0 (warm, sepia-like tone).',
      minimum: 0,
      maximum: 1,
    }),
  },
  description: 'Optional CSS color adjustment parameters to improve the styling of the image.',
});

const CropSchema = Schema.object({
  properties: {
    xMin: Schema.number({
      description: 'Minimum x-coordinate for cropping.',
    }),
    yMin: Schema.number({
      description: 'Minimum y-coordinate for cropping.',
    }),
    xMax: Schema.number({
      description: 'Maximum x-coordinate for cropping.',
    }),
    yMax: Schema.number({
      description: 'Maximum y-coordinate for cropping.',
    }),
  },
  description: 'Optional cropping parameters for the image.',
});

const RecommendationItemSchema = Schema.object({
  properties: {
    recommendation: Schema.string({
      description: 'The recommendation.',
    }),
    sentence: Schema.string({
      description: 'A sentence explaining why this recommendation was chosen for the image.',
    }),
  },
  description: 'A tag with its name and selection explanation.',
});

const RecommendationsSchema = Schema.array({
  items: RecommendationItemSchema,
  minItems: 1,
  maxItems: 3,
  description: 'At most 3 recommendations to make the image more interesting or appealing.',
});

const TagItemSchema = Schema.object({
  properties: {
    name: Schema.string({
      description: 'The tag name.',
    }),
    sentence: Schema.string({
      description: 'A sentence explaining why this tag was chosen for the image.',
    }),
  },
  description: 'A tag with its name and selection explanation.',
});

const TagsSchema = Schema.array({
  items: TagItemSchema,
  minItems: 2,
  maxItems: 4,
  description: 'At least 2 and no more than 4 relevant tags describing the image, each with a justification sentence.',
});

export const ImageAnalysisSchema = Schema.object({
  properties: {
    alternativeTexts: AltTextsSchema,
    tags: TagsSchema,
    recommendations: RecommendationsSchema,
    crop: CropSchema,
    colorAdjustment: ColorAdjustmentSchema,
  },
  optionalProperties: ['colorAdjustment', 'crop'],
  description:
    'Structured output containing alternative text, tags, recommendations, and styling adjustments for the image.',
});
