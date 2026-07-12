import { EnhancedCanvas } from '@/features/image-analysis/enhanced-canvas/enhanced-canvas';
import { ImageCrop } from '@/features/image-analysis/image-crop/image-crop';
import { SanitizeAdjustmentService } from '@/features/image-analysis/services/sanitize-adjustment';
import { ImageEffect } from '@/features/image-enhancer/services/image-effect';
import { Component, computed, inject, input } from '@angular/core';
import { ImageAnalysisResponse } from '../types/image-analysis-metadata.type';

@Component({
  selector: 'app-image-improvement',
  imports: [ImageCrop, EnhancedCanvas],
  templateUrl: './image-improvement.html',
  styleUrl: './image-improvement.css',
})
export class ImageImprovement {
  imageUrl = input<string | null>(null);
  analysis = input<ImageAnalysisResponse | null>(null);

  sanitizeAdjustment = inject(SanitizeAdjustmentService);
  imageEffect = inject(ImageEffect);

  safeColorAdjustment = computed(() => {
    const adj = this.analysis()?.colorAdjustment;
    return this.sanitizeAdjustment.sanitizeColorAdjustments(adj);
  });

  safeCrop = computed(() => {
    const crop = this.analysis()?.crop;
    return this.sanitizeAdjustment.sanitizeCrop(crop);
  });

  // Safe formatting helpers for crop settings
  cropImage = computed(() => this.imageEffect.cropImage(this.safeCrop(), 100));

  cropPosition = computed(() => {
    const safeCrop = this.safeCrop();
    if (safeCrop) {
      return `X: ${safeCrop.xMin}–${safeCrop.xMax} | Y: ${safeCrop.yMin}–${safeCrop.yMax}`;
    }
    return 'N/A';
  });
}
