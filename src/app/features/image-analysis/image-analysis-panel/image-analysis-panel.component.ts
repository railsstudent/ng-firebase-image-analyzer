import { ImageImprovementComponent } from '@/features/image-analysis/image-improvement/image-improvement.component';
import { ImageRecommendationComponent } from '@/features/image-analysis/image-recommendation/image-recommendation.component';
import { ThoughtSummaryComponent } from '@/shared/ui/components/thought-summary/thought-summary.component';
import { TokenAnalyticsComponent } from '@/shared/ui/components/token-analytics/token-analytics.component';
import { DisplaySource } from '@/features/image-analysis/types/display-source.type';
import { StreamingAnalysisWithMetadata } from '@/core/image-analysis';
import { TabGroupComponent } from '@/shared/ui/components/tab-group/tab-group.component';
import { TabComponent } from '@/shared/ui/components/tab/tab.component';
import { Component, computed, input } from '@angular/core';
import { InferenceSource } from 'firebase/ai';
import { ImageImprovementSkeletonComponent } from '@/features/image-analysis/image-improvement-skeleton/image-improvement-skeleton.component';
import { ImageRecommendationSkeletonComponent } from '@/features/image-analysis/image-recommendation-skeleton/image-recommendation-skeleton.component';
import { TokenAnalyticsSkeletonComponent } from '@/shared/ui/components/token-analytics-skeleton/token-analytics-skeleton.component';

@Component({
  selector: 'app-image-analysis-panel',
  imports: [
    TabGroupComponent,
    TabComponent,
    TokenAnalyticsComponent,
    ImageRecommendationComponent,
    ThoughtSummaryComponent,
    ImageImprovementComponent,
    ImageImprovementSkeletonComponent,
    ImageRecommendationSkeletonComponent,
    TokenAnalyticsSkeletonComponent,
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
