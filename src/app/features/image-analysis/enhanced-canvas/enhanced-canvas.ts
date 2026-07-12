import { DownloadEnhancedDirective } from '@/features/image-analysis/directives/download-enhanced';
import { ColorAdjustment } from '@/features/image-analysis/types/color-adjustment.type';
import { ImageEffect } from '@/features/image-enhancer/services/image-effect';
import { CropImageStyles } from '@/features/image-enhancer/types/crop-image.type';
import { Component, computed, inject, input } from '@angular/core';

@Component({
  selector: 'app-enhanced-canvas',
  imports: [DownloadEnhancedDirective],
  templateUrl: './enhanced-canvas.html',
  styleUrl: './enhanced-canvas.css',
})
export class EnhancedCanvas {
  imageUrl = input<string | null>(null);
  cropImage = input.required<CropImageStyles>();
  colorAdjustment = input<ColorAdjustment | undefined>(undefined);

  #imageEffect = inject(ImageEffect);

  containerCss = computed(() => this.cropImage().containerStyle);
  imageCss = computed(() => this.cropImage().imageStyle);
  crop = computed(() => this.cropImage().crop);
  filterStyle = computed(() => this.#imageEffect.getCssFilter(this.colorAdjustment()));
}
