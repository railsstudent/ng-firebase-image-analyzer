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

  readonly calibration = computed(() => {
    const analysis = this.analysis();
    const safeCrop = this.#imageEffect.sanitizeCrop(analysis?.crop);
    const safeColorAdjustment = this.#imageEffect.sanitizeColorAdjustments(analysis?.colorAdjustment);
    const cropImage = this.#imageEffect.cropImage(safeCrop, DEFAULT_IMAGE_WIDTH);
    const filterStyle = this.#imageEffect.getCssFilter(safeColorAdjustment);
    const cropPosition = safeCrop
      ? `X: ${safeCrop.xMin}–${safeCrop.xMax} | Y: ${safeCrop.yMin}–${safeCrop.yMax}`
      : 'N/A';

    return {
      safeCrop,
      safeColorAdjustment,
      cropImage,
      aspectRatio: cropImage.containerStyle.aspectRatio,
      cropPosition,
      filterStyle,
    };
  });

  readonly showSkeleton = computed(
    () =>
      !this.imageUrl() ||
      this.analysis() === null ||
      this.analysis()?.crop === undefined ||
      this.analysis()?.colorAdjustment === undefined,
  );
}
