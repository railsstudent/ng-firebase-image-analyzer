import { TokenSegmentType } from './token-segment.type';

export interface TokenLegendItem {
  type: TokenSegmentType;
  itemCssClass: string;
  itemDotCssClass: string;
  token: number;
  label: string;
}
