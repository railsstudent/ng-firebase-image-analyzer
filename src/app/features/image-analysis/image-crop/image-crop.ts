import { ColorAdjustment } from '@/features/image-analysis/types/color-adjustment.type';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-image-crop',
  templateUrl: './image-crop.html',
  styleUrl: './image-crop.css',
})
export class ImageCrop {
  colorAdjustment = input<ColorAdjustment | undefined>(undefined);
  aspectRatio = input('');
  cropPosition = input('');
}
