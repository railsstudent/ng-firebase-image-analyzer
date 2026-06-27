import { Schema } from 'firebase/ai';

export const ColorAdjustmentSchema = Schema.object({
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
