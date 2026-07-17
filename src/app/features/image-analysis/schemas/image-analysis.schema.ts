import { Schema } from 'firebase/ai';
import { AltTextsSchema } from './alt-texts.schema';
import { ColorAdjustmentSchema } from './color-adjustment.schema';
import { CropSchema } from './crop.schema';
import { RecommendationsSchema } from './recommendation.schema';
import { TagsSchema } from './tag.schema';

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
