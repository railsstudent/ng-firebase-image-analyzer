import { SanitizeAdjustmentService } from '@/features/image-analysis/services/sanitize-adjustment';
import { ImageAnalysisWithMetadata } from '@/features/image-analysis/types/image-analysis-metadata.type';
import { ImageEffect } from '@/features/image-enhancer/services/image-effect';
import { TabGroup } from '@/shared/ui/components/tab-group/tab-group';
import { Tab } from '@/shared/ui/components/tab/tab';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { InferenceSource } from 'firebase/ai';

@Component({
  selector: 'app-image-analysis-panel',
  standalone: true,
  imports: [TabGroup, Tab],
  templateUrl: './image-analysis-panel.html',
  styleUrl: './image-analysis-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  // Safe token counts extracted from response
  totalTokens = computed(() => this.data()?.tokenSummary?.totalTokenCount ?? 0);
  promptTokens = computed(() => this.data()?.tokenSummary?.promptTokenCount ?? 0);
  candidatesTokens = computed(() => this.data()?.tokenSummary?.outputTokenCount ?? 0);
  cachedTokens = computed(() => this.data()?.tokenSummary?.cachedContentTokenCount ?? 0);
  thoughtTokens = computed(() => this.data()?.tokenSummary?.thoughtsTokenCount ?? 0);

  // Parse details for prompt modality token split
  promptTextTokens = computed(() => {
    const textDetail = this.data()?.tokenModalityBreakdown?.promptTokensDetails?.find(
      (d) => d.modality.toLowerCase() === 'text',
    );
    return textDetail?.tokenCount ?? 0;
  });

  promptImageTokens = computed(() => {
    const imageDetail = this.data()?.tokenModalityBreakdown?.promptTokensDetails?.find(
      (d) => d.modality.toLowerCase() === 'image',
    );
    return imageDetail?.tokenCount ?? 0;
  });

  // Parse details for output modality token split
  outputTextTokens = computed(() => {
    const textDetail = this.data()?.tokenModalityBreakdown?.outputTokensDetails?.find(
      (d) => d.modality.toLowerCase() === 'text',
    );
    return textDetail?.tokenCount ?? 0;
  });

  outputImageTokens = computed(() => {
    const imageDetail = this.data()?.tokenModalityBreakdown?.outputTokensDetails?.find(
      (d) => d.modality.toLowerCase() === 'image',
    );
    return imageDetail?.tokenCount ?? 0;
  });

  // Parse details for output modality token split
  cachedTextTokens = computed(() => {
    const textDetail = this.data()?.tokenModalityBreakdown?.cacheTokensDetails?.find(
      (d) => d.modality.toLowerCase() === 'text',
    );
    return textDetail?.tokenCount ?? 0;
  });

  cachedImageTokens = computed(() => {
    const imageDetail = this.data()?.tokenModalityBreakdown?.cacheTokensDetails?.find(
      (d) => d.modality.toLowerCase() === 'image',
    );
    return imageDetail?.tokenCount ?? 0;
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
