import { Schema } from 'firebase/ai';
import { ColorAdjustmentSchema } from './color-adjustment.schema';
import { RecomendationSchema } from './recommendation.schema';
import { TagSchema } from './tag.schema';
import { CropSchema } from './crop.schema';

export const ImageAnalysisSchema = Schema.object({
  properties: {
    alternativeTexts: Schema.array({
      items: Schema.string({
        description: 'An alternative text description for the image.',
      }),
      minItems: 1,
      maxItems: 2,
      description: '1 to 3 alternative text options for the image.',
    }),
    tags: Schema.array({
      items: TagSchema,
      minItems: 2,
      maxItems: 3,
      description: 'At least 3 relevant tags describing the image, each with a justification sentence.',
    }),
    recommendations: Schema.array({
      items: RecomendationSchema,
      description: 'Recommendations to make the image more interesting or appealing.',
      minItems: 1,
      maxItems: 2,
    }),
    crop: CropSchema,
    colorAdjustment: ColorAdjustmentSchema,
  },
  optionalProperties: ['colorAdjustment', 'crop'],
  description:
    'Structured output containing alternative text, tags, recommendations, and styling adjustments for the image.',
});
