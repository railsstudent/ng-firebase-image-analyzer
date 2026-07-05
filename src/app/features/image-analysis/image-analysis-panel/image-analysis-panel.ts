import { ImageRecommendation } from '@/features/image-analysis/image-recommendation/image-recommendation';
import { SanitizeAdjustmentService } from '@/features/image-analysis/services/sanitize-adjustment';
import { ThoughtSummary } from '@/features/image-analysis/thought-summary/thought-summary';
import { TokenAnalytics } from '@/features/image-analysis/token-analytics/token-analytics';
import { ImageAnalysisWithMetadata } from '@/features/image-analysis/types/image-analysis-metadata.type';
import { ImageEffect } from '@/features/image-enhancer/services/image-effect';
import { TabGroup } from '@/shared/ui/components/tab-group/tab-group';
import { Tab } from '@/shared/ui/components/tab/tab';
import { Component, computed, inject, input } from '@angular/core';
import { InferenceSource } from 'firebase/ai';

@Component({
  selector: 'app-image-analysis-panel',
  imports: [TabGroup, Tab, TokenAnalytics, ImageRecommendation, ThoughtSummary],
  templateUrl: './image-analysis-panel.html',
  styleUrl: './image-analysis-panel.css',
})
export class ImageAnalysisPanel {
  data = input<ImageAnalysisWithMetadata | null>(null);
  imageUrl = input<string | null>(null);
  performance = input(0);
  source = input<InferenceSource | undefined>(undefined);

  sanitizeAdjustment = inject(SanitizeAdjustmentService);
  imageEffect = inject(ImageEffect);

  // Computes the CSS filter style string directly from the color adjustment response values
  filterStyle = computed(() => {
    const adj = this.data()?.analysis?.colorAdjustment;
    const safeAdj = this.sanitizeAdjustment.sanitizeColorAdjustments(adj);
    return this.imageEffect.getCssFilter(safeAdj);
  });

  // Safe formatting helpers for crop settings
  cropImage = computed(() => {
    const crop = this.data()?.analysis?.crop;
    const safeCrop = this.sanitizeAdjustment.sanitizeCrop(crop);
    return this.imageEffect.cropImage(safeCrop);
  });

  containerCss = computed(() => {
    return this.cropImage()?.containerStyle;
  });

  imageCss = computed(() => {
    return this.cropImage()?.imageStyle;
  });

  aspectRatio = computed(() => {
    return this.containerCss().aspectRatio;
  });

  cropPosition = computed(() => {
    const crop = this.data()?.analysis?.crop;
    const safeCrop = this.sanitizeAdjustment.sanitizeCrop(crop);
    if (safeCrop) {
      return `xMin: ${safeCrop.xMin}, xMax: ${safeCrop.xMax}, yMin: ${safeCrop.yMin}, yMax: ${safeCrop.yMax}`;
    }
    return 'N/A';
  });

  sourceExplained = computed(() => {
    if (this.source()) {
      if (this.source() == 'on_device') {
        return 'Gemini Nano';
      } else if (this.source() === 'in_cloud') {
        return 'Cloud AI';
      }
    }
    return 'N/A';
  });

  // Fallback download helper for image improvement preview
  downloadEnhancedImage(url: string) {
    if (!url) return;
    fetch(url)
      .then((r) => r.blob())
      .then((b) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = 'enhanced-image.png';
        a.click();
      });
  }
}
