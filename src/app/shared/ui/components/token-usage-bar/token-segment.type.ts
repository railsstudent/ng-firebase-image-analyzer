type TokenSegmentType = 'prompt' | 'output' | 'cached' | 'thought' | 'Text' | 'Image';

export interface TokenSegment {
  type: TokenSegmentType;
  widthPercentage: number;
  colorClass: string;
  title: string;
}

export interface TokenLegendItem {
  type: TokenSegmentType;
  itemDotCssClass: string;
  token: number;
  label: string;
}

export interface ModalitySegmentsLegend {
  segments: TokenSegment[];
  legend: TokenLegendItem[];
}
