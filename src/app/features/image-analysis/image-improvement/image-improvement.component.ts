import type { ImageAnalysisResponse } from '@/core/image-analysis';
import { EnhancedCanvasComponent } from '@/features/image-analysis/enhanced-canvas/enhanced-canvas.component';
import { ImageCropComponent } from '@/features/image-analysis/image-crop/image-crop.component';
import { VisualCalibrationService } from '@/features/image-analysis/services/visual-calibration.service';
import { AutoAwesomeIconComponent } from '@/shared/ui/icons/auto-awesome-icon/auto-awesome-icon.component';
import { Component, computed, inject, input } from '@angular/core';
import { ImageImprovementSkeletonComponent } from './image-improvement-skeleton.component';

@Component({
  selector: 'app-image-improvement',
  imports: [ImageCropComponent, EnhancedCanvasComponent, ImageImprovementSkeletonComponent, AutoAwesomeIconComponent],
  templateUrl: './image-improvement.component.html',
  styleUrls: ['./image-improvement.component.css'],
})
export class ImageImprovementComponent {
  imageUrl = input<string | null>(null);
  analysis = input<Partial<ImageAnalysisResponse> | null>(null);
  readonly #imageEffect = inject(VisualCalibrationService);

  readonly calibration = computed(() => this.#imageEffect.calibrate(this.analysis()));

  readonly showSkeleton = computed(
    () =>
      !this.imageUrl() ||
      this.analysis() === null ||
      this.analysis()?.crop === undefined ||
      this.analysis()?.colorAdjustment === undefined,
  );
}
