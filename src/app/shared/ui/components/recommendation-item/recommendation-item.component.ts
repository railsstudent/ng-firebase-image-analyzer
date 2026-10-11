import { Component } from '@angular/core';

@Component({
  selector: 'app-recommendation-item',
  templateUrl: './recommendation-item.component.html',
  host: {
    role: 'listitem',
    class: 'recommendation-item',
  },
  styleUrl: './recommendation-item.component.css',
})
export class RecommendationItemComponent {}
