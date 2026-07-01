import { Schema } from 'firebase/ai';

export const CropSchema = Schema.object({
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
