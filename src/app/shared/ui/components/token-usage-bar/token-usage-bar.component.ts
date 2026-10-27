import { Component, computed, input } from '@angular/core';
import type {
  ColoredTokenLegendItem,
  ColoredTokenSegment,
  TokenLegendItem,
  TokenSegment,
  TokenSegmentType,
} from './token-segment.type';

@Component({
  selector: 'app-token-usage-bar',
  templateUrl: './token-usage-bar.component.html',
  styleUrl: './token-usage-bar.component.css',
})
export class TokenUsageBarComponent {
  barCss = input('shadow-sm h-8');
  tokenSegments = input<TokenSegment[]>([]);

  gridCssClass = input('token-legend-grid');
  gridItems = input<TokenLegendItem[]>([]);

  coloredTokenSegments = computed<ColoredTokenSegment[]>(() =>
    this.tokenSegments().map((segment) => ({
      ...segment,
      colorClass: this.getColorCssClass(segment.type),
    })),
  );

  coloredGridItems = computed<ColoredTokenLegendItem[]>(() =>
    this.gridItems().map((item) => ({
      ...item,
      itemDotCssClass: this.getColorCssClass(item.type),
    })),
  );

  private getColorCssClass(segmentType: TokenSegmentType): string {
    let colorClass = 'bg-primary';
    switch (segmentType) {
      case 'Text':
      case 'prompt':
        colorClass = 'bg-primary';
        break;
      case 'Image':
      case 'output':
        colorClass = 'bg-secondary';
        break;
      case 'cached':
        colorClass = 'bg-tertiary';
        break;
      case 'thought':
        colorClass = 'bg-quaternary';
        break;
    }
    return colorClass;
  }
}
