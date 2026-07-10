import { Component, input } from '@angular/core';
import { RecommendationList } from '@/shared/ui/components/recommendation-list/recommendation-list';
import { RecommendationItem } from '@/shared/ui/components/recommendation-item/recommendation-item';

@Component({
  selector: 'app-thought-summary',
  imports: [RecommendationList, RecommendationItem],
  template: ` <div class="analysis-section-card space-y-4">
    <h3 class="section-title">
      <span class="material-symbols-outlined section-title-icon">psychology</span>
      AI Reasoning Overview
    </h3>

    <div class="space-y-3">
      <p class="reasoning-text"><span class="thought-label">Performance:</span> {{ performance() }} ms</p>
      <p class="reasoning-text"><span class="thought-label">Source:</span> {{ source() }}</p>
      <p class="reasoning-text">{{ thoughtSummary() }}</p>

      <app-recommendation-list listTitle="Suggested Alternative Texts">
        @for (alt of alternativeTexts(); track alt; let i = $index) {
          <app-recommendation-item> {{ i + 1 }}. {{ alt }} </app-recommendation-item>
        }
      </app-recommendation-list>
    </div>
  </div>`,
  styleUrl: './thought-summary.css',
})
export class ThoughtSummary {
  performance = input(0);
  source = input('N/A');
  thoughtSummary = input('No technical logs provided.');
  alternativeTexts = input<string[]>([]);
}
