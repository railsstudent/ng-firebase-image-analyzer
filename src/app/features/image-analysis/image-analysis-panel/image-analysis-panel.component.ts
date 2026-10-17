import type { StreamingAnalysisWithMetadata } from '@/core/image-analysis';
import { ImageImprovementComponent } from '@/features/image-analysis/image-improvement/image-improvement.component';
import { ImageRecommendationComponent } from '@/features/image-analysis/image-recommendation/image-recommendation.component';
import type { DisplaySource } from '@/features/image-analysis/types/display-source.type';
import { SkeletonComponent } from '@/shared/ui/components/skeleton';
import { TabComponent, TabGroupComponent } from '@/shared/ui/components/tab-group';
import { ThoughtSummaryComponent } from '@/shared/ui/components/thought-summary/thought-summary.component';
import { TokenAnalyticsComponent } from '@/shared/ui/components/token-analytics/token-analytics.component';
import { Component, computed, input } from '@angular/core';
import type { InferenceSource } from 'firebase/ai';

@Component({
  selector: 'app-image-analysis-panel',
  imports: [
    TabGroupComponent,
    TabComponent,
    TokenAnalyticsComponent,
    ImageRecommendationComponent,
    ThoughtSummaryComponent,
    ImageImprovementComponent,
    SkeletonComponent,
  ],
  templateUrl: './image-analysis-panel.component.html',
  styleUrls: [
    '../../../shared/ui/styles/section-card.css',
    '../../../shared/ui/styles/empty-state.css',
    './image-analysis-panel.component.css',
  ],
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
