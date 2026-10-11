import { Component, input } from '@angular/core';

@Component({
  selector: 'app-recommendation-list',
  template: `
    @if (listTitle()) {
      <p class="recommendation-list-title">{{ listTitle() }}</p>
    }
    <ng-content />
  `,
  host: {
    role: 'list',
    class: 'recommendations-list',
  },
  styleUrl: './recommendation-list.component.css',
})
export class RecommendationListComponent {
  listTitle = input<string | null>(null);
}
