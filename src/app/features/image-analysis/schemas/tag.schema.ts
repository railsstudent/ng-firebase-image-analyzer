import { Schema } from 'firebase/ai';

const TagSchema = Schema.object({
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

export const TagsSchema = Schema.array({
  items: TagSchema,
  minItems: 2,
  maxItems: 3,
  description: 'At least 2 and no more than 3 relevant tags describing the image, each with a justification sentence.',
});
