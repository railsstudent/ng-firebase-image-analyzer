import { Component, input } from '@angular/core';
import { Recommendation } from '../types/recommendation.type';

@Component({
  selector: 'app-image-recommendation',
  template: ` <div class="analysis-section-card space-y-4">
    <h3 class="section-title">
      <span class="material-symbols-outlined section-title-icon">auto_awesome</span>
      Visual & Composition Insights
    </h3>

    <ul class="recommendations-list">
      @for (rec of recommendations(); track rec.recommendation) {
        <li class="recommendation-item">
          <p class="recommendation-title">
            <span class="recommendation-indicator"></span>
            {{ rec.recommendation }}
          </p>
          <p class="recommendation-reason">
            {{ rec.sentence }}
          </p>
        </li>
      }
    </ul>
  </div>`,
  styleUrl: './image-recommendation.css',
})
export class ImageRecommendation {
  recommendations = input<Recommendation[]>([]);
}
