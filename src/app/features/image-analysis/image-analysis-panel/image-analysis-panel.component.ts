import type { StreamingAnalysisWithMetadata } from '@/core/image-analysis';
import { ImageImprovementSkeletonComponent } from '@/features/image-analysis/image-improvement/image-improvement-skeleton.component';
import { ImageImprovementComponent } from '@/features/image-analysis/image-improvement/image-improvement.component';
import { ImageRecommendationComponent } from '@/features/image-analysis/image-recommendation/image-recommendation.component';
import { ListSkeletonComponent } from '@/shared/ui/components/skeleton';
import { TabComponent, TabGroupComponent } from '@/shared/ui/components/tab-group';
import { ThoughtSummaryComponent } from '@/shared/ui/components/thought-summary/thought-summary.component';
import { TokenAnalyticsComponent } from '@/shared/ui/components/token-analytics/token-analytics.component';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-image-analysis-panel',
  imports: [
    TabGroupComponent,
    TabComponent,
    TokenAnalyticsComponent,
    ImageRecommendationComponent,
    ThoughtSummaryComponent,
    ImageImprovementComponent,
    ListSkeletonComponent,
    ImageImprovementSkeletonComponent,
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
}
