import { ImageImprovement } from '@/features/image-analysis/image-improvement/image-improvement';
import { ImageRecommendation } from '@/features/image-analysis/image-recommendation/image-recommendation';
import { ThoughtSummary } from '@/features/image-analysis/thought-summary/thought-summary';
import { TokenAnalytics } from '@/features/image-analysis/token-analytics/token-analytics';
import { ImageAnalysisWithMetadata } from '@/features/image-analysis/types/image-analysis-metadata.type';
import { TabGroup } from '@/shared/ui/components/tab-group/tab-group';
import { Tab } from '@/shared/ui/components/tab/tab';
import { Component, computed, input } from '@angular/core';
import { InferenceSource } from 'firebase/ai';
import { DisplaySource } from '../types/display-source.type';

@Component({
  selector: 'app-image-analysis-panel',
  imports: [TabGroup, Tab, TokenAnalytics, ImageRecommendation, ThoughtSummary, ImageImprovement],
  templateUrl: './image-analysis-panel.html',
  styleUrl: './image-analysis-panel.css',
})
export class ImageAnalysisPanel {
  data = input<ImageAnalysisWithMetadata | null>(null);
  imageUrl = input<string | null>(null);
  performance = input(0);
  source = input<InferenceSource | undefined>(undefined);

  sourceExplained = computed<DisplaySource>(() => {
    if (this.source()) {
      if (this.source() == 'on_device') {
        return 'Gemini Nano';
      } else if (this.source() === 'in_cloud') {
        return 'Cloud AI';
      }
    }
    return 'Unknown';
  });
}
