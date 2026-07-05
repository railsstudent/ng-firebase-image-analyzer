import { Component, input } from '@angular/core';
import { TokenSegment } from './types/token-segment.type';
import { TokenLegendItem } from './types/token-legend-item.type';

@Component({
  selector: 'app-token-usage-bar',
  template: ` <div [class]="barCss()">
      @for (tokenSegment of tokenSegments(); track tokenSegment.type) {
        <div
          [class]="tokenSegment.colorClass"
          [style.width.%]="tokenSegment.widthPercentage"
          [title]="tokenSegment.title"
        ></div>
      }
    </div>
    <div [class]="gridCssClass()">
      @for (legendItem of gridItems(); track legendItem.type) {
        <div [class]="legendItem.itemCssClass">
          <div [class]="'legend-dot ' + legendItem.itemDotCssClass"></div>
          <span class="legend-text">{{ legendItem.label }}: {{ legendItem.token }}</span>
        </div>
      }
    </div>`,
  styleUrl: './token-usage-bar.css',
})
export class TokenUsageBar {
  barCss = input('segmented-progress-bar');
  tokenSegments = input<TokenSegment[]>([]);

  gridCssClass = input('token-legend-grid');
  gridItems = input<TokenLegendItem[]>([]);
}
