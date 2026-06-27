import { Schema } from 'firebase/ai';

export const TagSchema = Schema.object({
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
