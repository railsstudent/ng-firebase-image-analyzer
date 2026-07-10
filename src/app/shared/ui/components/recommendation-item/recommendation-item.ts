import { Component } from '@angular/core';

@Component({
  selector: 'app-recommendation-item',
  standalone: true,
  template: `
    <p class="recommendation-item-title">
      <ng-content select="[indicator]"></ng-content>
      <ng-content select="[title]"></ng-content>
    </p>

    <p class="recommendation-item-reason">
      <ng-content></ng-content>
    </p>
  `,
  host: {
    role: 'listitem',
    class: 'recommendation-item',
  },
  styleUrl: './recommendation-item.css',
})
export class RecommendationItem {}
