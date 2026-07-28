import { Component, input } from '@angular/core';
import { Recommendation } from '../types/recommendation.type';
import { RecommendationList } from '@/shared/ui/components/recommendation-list/recommendation-list';
import { RecommendationItem } from '@/shared/ui/components/recommendation-item/recommendation-item';

@Component({
  selector: 'app-image-recommendation',
  imports: [RecommendationList, RecommendationItem],
  templateUrl: './image-recommendation.html',
  styleUrl: './image-recommendation.css',
})
export class ImageRecommendation {
  recommendations = input<Recommendation[] | undefined>(undefined);
}
