import { Schema } from 'firebase/ai';

export const RecomendationSchema = Schema.object({
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
