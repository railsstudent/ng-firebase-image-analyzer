import { ColorAdjustment } from '@/features/image-analysis/types/color-adjustment.type';
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-image-crop',
  templateUrl: './image-crop.html',
  styleUrl: './image-crop.css',
})
export class ImageCrop {
  colorAdjustment = input<ColorAdjustment | undefined>(undefined);
  aspectRatio = input('');
  cropPosition = input('');

  appliedFilters = computed(() => {
    const keys: (keyof ColorAdjustment)[] = ['brightness', 'saturation', 'contrast', 'warmth'];
    const adj = this.colorAdjustment();

    return keys.map((key) => ({
      label: `${key.charAt(0).toUpperCase()}${key.slice(1)}`,
      value: adj?.[key] ?? 'N/A',
    }));
  });
}
