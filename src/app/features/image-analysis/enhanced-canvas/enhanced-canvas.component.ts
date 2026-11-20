import { DownloadEnhancedDirective } from '@/features/image-analysis/directives/download-enhanced.directive';
import type {
  CropImageStyles,
  VisualCalibrationResult,
} from '@/features/image-analysis/interfaces/visual-calibration.interface';
import { DownloadIconComponent } from '@/shared/ui/icons/download-icon/download-icon.component';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-enhanced-canvas',
  host: {
    class: 'block md:col-span-2 w-full',
  },
  imports: [DownloadEnhancedDirective, DownloadIconComponent],
  templateUrl: './enhanced-canvas.component.html',
  styleUrl: './enhanced-canvas.component.css',
})
export class EnhancedCanvasComponent {
  imageUrl = input<string | null>(null);
  calibration = input.required<VisualCalibrationResult>();
  cropStyles = input.required<CropImageStyles>();
  naturalAspectRatioChange = output<number | null>();

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
      this.naturalAspectRatioChange.emit(img.naturalWidth / img.naturalHeight);
    }
  }

  onImageError(): void {
    this.naturalAspectRatioChange.emit(null);
  }
}
