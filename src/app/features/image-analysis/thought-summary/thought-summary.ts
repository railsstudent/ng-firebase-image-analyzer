import { Component, input } from '@angular/core';

@Component({
  selector: 'app-thought-summary',
  template: ` <div class="analysis-section-card space-y-4">
    <h3 class="section-title">
      <span class="material-symbols-outlined section-title-icon">psychology</span>
      AI Reasoning Overview
    </h3>

    <div class="space-y-3">
      <p class="reasoning-text">Performance: {{ performance() }} ms</p>
      <p class="reasoning-text">Source: {{ source() }}</p>
      <p class="reasoning-text">{{ thoughtSummary() }}</p>

      <p>Alternative Texts</p>
      <ul class="recommendations-list">
        @for (alt of alternativeTexts(); track alt; let i = $index) {
          <li class="recommendation-item">
            <p class="recommendation-reason">{{ i + 1 }}. {{ alt }}</p>
          </li>
        }
      </ul>
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
