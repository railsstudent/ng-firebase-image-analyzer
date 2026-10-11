import { Component, input } from '@angular/core';
import { TokenSegment } from './token-segment.type';
import { TokenLegendItem } from './token-legend-item.type';

@Component({
  selector: 'app-token-usage-bar',
  templateUrl: './token-usage-bar.component.html',
  styleUrl: './token-usage-bar.component.css',
})
export class TokenUsageBarComponent {
  barCss = input('segmented-progress-bar');
  tokenSegments = input<TokenSegment[]>([]);

  gridCssClass = input('token-legend-grid');
  gridItems = input<TokenLegendItem[]>([]);
}
