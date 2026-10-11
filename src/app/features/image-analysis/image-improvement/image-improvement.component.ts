import { ImageAnalysisResponse } from '@/core/image-analysis';
import { EnhancedCanvasComponent } from '@/features/image-analysis/enhanced-canvas/enhanced-canvas.component';
import { ImageCropComponent } from '@/features/image-analysis/image-crop/image-crop.component';
import { ImageImprovementSkeletonComponent } from '@/features/image-analysis/image-improvement-skeleton/image-improvement-skeleton.component';
import {
  DEFAULT_IMAGE_WIDTH,
  VisualCalibrationService,
} from '@/features/image-analysis/services/visual-calibration.service';
import { PhotoFilterIconComponent } from '@/shared/ui/icons/photo-filter-icon/photo-filter-icon.component';
import { Component, computed, inject, input } from '@angular/core';

@Component({
  selector: 'app-image-improvement',
  imports: [ImageCropComponent, EnhancedCanvasComponent, ImageImprovementSkeletonComponent, PhotoFilterIconComponent],
  templateUrl: './image-improvement.component.html',
  styleUrls: ['../../../shared/ui/styles/section-card.css', './image-improvement.component.css'],
})
export class ImageImprovementComponent {
  imageUrl = input<string | null>(null);
  analysis = input<Partial<ImageAnalysisResponse> | null>(null);
  readonly #imageEffect = inject(VisualCalibrationService);

  safeColorAdjustment = computed(() => this.#imageEffect.sanitizeColorAdjustments(this.analysis()?.colorAdjustment));

  safeCrop = computed(() => this.#imageEffect.sanitizeCrop(this.analysis()?.crop));

  // Safe formatting helpers for crop settings
  cropImage = computed(() => this.#imageEffect.cropImage(this.safeCrop(), DEFAULT_IMAGE_WIDTH));

  aspectRatio = computed(() => this.cropImage().containerStyle.aspectRatio);

  cropPosition = computed(() => {
    const safeCrop = this.safeCrop();
    if (safeCrop) {
      return `X: ${safeCrop.xMin}–${safeCrop.xMax} | Y: ${safeCrop.yMin}–${safeCrop.yMax}`;
    }
    return 'N/A';
  });

  showSkeleton = computed(
    () =>
      !this.imageUrl() ||
      this.analysis() === null ||
      this.analysis()?.crop === undefined ||
      this.analysis()?.colorAdjustment === undefined,
  );

  filterStyle = computed(() => this.#imageEffect.getCssFilter(this.safeColorAdjustment()));
}
