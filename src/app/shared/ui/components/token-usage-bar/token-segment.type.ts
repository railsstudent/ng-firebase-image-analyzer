export type TokenSegmentType = 'prompt' | 'output' | 'cached' | 'thought' | 'Text' | 'Image';

export interface TokenSegment {
  type: TokenSegmentType;
  widthPercentage: number;
  colorClass: string;
  title: string;
}
