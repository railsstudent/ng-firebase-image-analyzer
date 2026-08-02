import { ImageRecommendationSkeleton } from '@/features/image-analysis/image-recommendation-skeleton/image-recommendation-skeleton';
import { RecommendationItem } from '@/shared/ui/components/recommendation-item/recommendation-item';
import { RecommendationList } from '@/shared/ui/components/recommendation-list/recommendation-list';
import { Component, input } from '@angular/core';
import { Recommendation } from '../types/recommendation.type';

@Component({
  selector: 'app-image-recommendation',
  imports: [RecommendationList, RecommendationItem, ImageRecommendationSkeleton],
  template: `<div class="analysis-section-card space-y-4">
    <h3 class="section-title">
      <span class="material-symbols-outlined section-title-icon">auto_awesome</span>
      Visual & Composition Insights
    </h3>
    @if (recommendations(); as recs) {
      <app-recommendation-list>
        @for (rec of recs; track rec.recommendation) {
          <app-recommendation-item>
            <span indicator class="recommendation-indicator"></span>
            <span title>{{ rec.recommendation }}</span>
            {{ rec.sentence }}
          </app-recommendation-item>
        }
      </app-recommendation-list>
    } @else {
      <app-image-recommendation-skeleton />
    }
  </div>`,
  styleUrl: './image-recommendation.css',
})
export class ImageRecommendation {
  recommendations = input<Recommendation[] | undefined>(undefined);
}
