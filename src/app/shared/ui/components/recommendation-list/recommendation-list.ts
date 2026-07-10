import { Component, input } from '@angular/core';

@Component({
  selector: 'app-recommendation-list',
  standalone: true,
  template: `
    @if (listTitle()) {
      <p class="recommendation-list-title">{{ listTitle() }}</p>
    }
    <ng-content></ng-content>
  `,
  host: {
    role: 'list',
    class: 'recommendations-list',
  },
  styleUrl: './recommendation-list.css',
})
export class RecommendationList {
  listTitle = input<string | null>(null);
}
