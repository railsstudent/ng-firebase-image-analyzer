import { Schema } from 'firebase/ai';

const RecomendationSchema = Schema.object({
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

export const RecommendationsSchema = Schema.array({
  items: RecomendationSchema,
  minItems: 1,
  maxItems: 2,
  description: 'At most 2 recommendations to make the image more interesting or appealing.',
});
