export type TokenSegmentType = 'prompt' | 'output' | 'cached' | 'thought' | 'Text' | 'Image';

export interface TokenSegment {
  type: TokenSegmentType;
  widthPercentage: number;
  title: string;
}

export interface ColoredTokenSegment extends TokenSegment {
  colorClass: string;
}

export interface TokenLegendItem {
  type: TokenSegmentType;
  token: number;
  label: string;
}

export interface ColoredTokenLegendItem extends TokenLegendItem {
  itemDotCssClass: string;
}

export interface ModalitySegmentsLegend {
  segments: TokenSegment[];
  legend: TokenLegendItem[];
}
