import { Recommendation } from '@/core/image-analysis';
import { RecommendationItemComponent, RecommendationListComponent } from '@/shared/ui/components/recommendation-list';
import { ListSkeletonComponent } from '@/shared/ui/components/skeleton';
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
