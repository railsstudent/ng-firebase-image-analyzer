import { ImageImprovementComponent } from '@/features/image-analysis/image-improvement/image-improvement.component';
import { ImageRecommendationComponent } from '@/features/image-analysis/image-recommendation/image-recommendation.component';
import { ThoughtSummaryComponent } from '@/features/image-analysis/thought-summary/thought-summary.component';
import { TokenAnalyticsComponent } from '@/features/image-analysis/token-analytics/token-analytics.component';
import { DisplaySource } from '@/features/image-analysis/types/display-source.type';
import { StreamingAnalysisWithMetadata } from '@/features/image-analysis/types/streaming-analysis-with-metadata.type';
import { TabGroupComponent } from '@/shared/ui/components/tab-group/tab-group.component';
import { TabComponent } from '@/shared/ui/components/tab/tab.component';
import { Component, computed, input } from '@angular/core';
import { InferenceSource } from 'firebase/ai';

@Component({
  selector: 'app-image-analysis-panel',
  imports: [
    TabGroupComponent,
    TabComponent,
    TokenAnalyticsComponent,
    ImageRecommendationComponent,
    ThoughtSummaryComponent,
    ImageImprovementComponent,
  ],
  templateUrl: './image-analysis-panel.component.html',
  styleUrl: './image-analysis-panel.component.css',
})
export class ImageAnalysisPanelComponent {
  data = input<StreamingAnalysisWithMetadata | null>(null);
  imageUrl = input<string | null>(null);
  source = input<InferenceSource | undefined>(undefined);

  displaySource = computed<DisplaySource>(() => {
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
