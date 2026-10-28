import { Component } from '@angular/core';

@Component({
  selector: 'app-recommendation-item',
  templateUrl: './recommendation-item.component.html',
  host: {
    role: 'listitem',
    class: 'py-4 border-t border-outline-variant/20 first:border-t-0 block',
  },
  styleUrl: './recommendation-item.component.css',
})
export class RecommendationItemComponent {}
