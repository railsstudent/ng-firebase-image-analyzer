import { Schema } from 'firebase/ai';

export const AltTextsSchema = Schema.array({
  items: Schema.string({
    description: 'An alternative text description for the image.',
  }),
  minItems: 1,
  maxItems: 2,
  description: '1 to 2 alternative text options for the image.',
});
