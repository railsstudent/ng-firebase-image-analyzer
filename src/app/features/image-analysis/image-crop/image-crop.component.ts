import type { ColorAdjustment } from '@/core/image-analysis';
import { Component, computed, input } from '@angular/core';
import type { VisualCalibrationResult } from '@/features/image-analysis/interfaces/visual-calibration.interface';

@Component({
  selector: 'app-image-crop',
  host: {
    class: 'block md:col-span-1',
  },
  templateUrl: './image-crop.component.html',
  styleUrl: './image-crop.component.css',
})
export class ImageCropComponent {
  calibration = input.required<VisualCalibrationResult>();

  appliedFilters = computed(() => {
    const keys: (keyof ColorAdjustment)[] = ['brightness', 'saturation', 'contrast', 'warmth'];
    const adj = this.calibration().safeColorAdjustment;

    return keys.map((key) => ({
      label: `${key.charAt(0).toUpperCase()}${key.slice(1)}`,
      value: adj?.[key] ?? 'N/A',
    }));
  });
}
