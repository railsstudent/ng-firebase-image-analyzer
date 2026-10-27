import type { Recommendation } from '@/core/image-analysis';
import { RecommendationItemComponent } from '@/shared/ui/components/recommendation-list/recommendation-item.component';
import { RecommendationListComponent } from '@/shared/ui/components/recommendation-list/recommendation-list.component';
import { ListSkeletonComponent } from '@/shared/ui/components/skeleton/list-skeleton.component';
import { AutoAwesomeIconComponent } from '@/shared/ui/icons/auto-awesome-icon/auto-awesome-icon.component';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-image-recommendation',
  imports: [RecommendationListComponent, RecommendationItemComponent, AutoAwesomeIconComponent, ListSkeletonComponent],
  templateUrl: './image-recommendation.component.html',
  styleUrls: ['../../../shared/ui/styles/section-card.css', './image-recommendation.component.css'],
})
export class ImageRecommendationComponent {
  recommendations = input<Recommendation[] | undefined>(undefined);
}
