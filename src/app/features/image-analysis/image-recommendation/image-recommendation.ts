import { ImageRecommendationSkeleton } from '@/features/image-analysis/image-recommendation-skeleton/image-recommendation-skeleton';
import { Recommendation } from '@/features/image-analysis/types/recommendation.type';
import { RecommendationItem } from '@/shared/ui/components/recommendation-item/recommendation-item';
import { RecommendationList } from '@/shared/ui/components/recommendation-list/recommendation-list';
import { AutoAwesomeIconComponent } from '@/shared/ui/icons/auto-awesome-icon/auto-awesome-icon.component';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-image-recommendation',
  imports: [RecommendationList, RecommendationItem, ImageRecommendationSkeleton, AutoAwesomeIconComponent],
  templateUrl: './image-recommendation.html',
  styleUrl: './image-recommendation.css',
})
export class ImageRecommendation {
  recommendations = input<Recommendation[] | undefined>(undefined);
}
