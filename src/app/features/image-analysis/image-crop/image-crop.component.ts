import type { VisualCalibrationResult } from '@/features/image-analysis/interfaces/visual-calibration.interface';
import { Component, input } from '@angular/core';

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
}
