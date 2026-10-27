import { Component, input } from '@angular/core';

@Component({
  selector: 'app-badge',
  host: {
    style: 'display: inline-block',
  },
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.css',
})
export class BadgeComponent {
  label = input.required<string>();
  tooltip = input<string>();
}
