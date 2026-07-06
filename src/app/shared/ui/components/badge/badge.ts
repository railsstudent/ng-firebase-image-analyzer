import { Component, input } from '@angular/core';

@Component({
  selector: 'app-badge',
  template: ` <div class="tag-container">
    <span class="tag-pill">
      {{ label() }}
    </span>

    @let toolTipText = tooltip();
    @if (toolTipText) {
      <div class="tooltip-wrapper">
        <div class="tooltip-content">
          {{ toolTipText }}
          <div class="tooltip-arrow"></div>
        </div>
      </div>
    }
  </div>`,
  styleUrl: './badge.css',
})
export class Badge {
  label = input.required<string>();
  tooltip = input<string>();
}
