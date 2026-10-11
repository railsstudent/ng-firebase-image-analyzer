import { ColorAdjustment } from '@/core/image-analysis';
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-image-crop',
  templateUrl: './image-crop.component.html',
  styleUrl: './image-crop.component.css',
})
export class ImageCropComponent {
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
