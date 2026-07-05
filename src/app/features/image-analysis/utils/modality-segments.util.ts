import { findModalityTokenCount } from '@/core/utils/modality-token-count.util';
import { calculatePercentage } from '@/core/utils/percentage.util';
import { TokenSummary } from '@/features/ai/types/token-usage.type';
import { BaseModalityTokens, ModalitySegments } from '@/features/image-analysis/types/modality-tokens.type';
import { TokenLegendItem } from '@/shared/ui/components/token-usage-bar/types/token-legend-item.type';
import { TokenSegment } from '@/shared/ui/components/token-usage-bar/types/token-segment.type';
import { Modality, ModalityTokenCount } from 'firebase/ai';

function buildModalitySegments({ textTokens, imageTokens, totalTokens }: ModalitySegments): TokenSegment[] {
  const textPercentage = calculatePercentage(textTokens, totalTokens);
  const imagePercentage = calculatePercentage(imageTokens, totalTokens);

  return [
    {
      type: 'Text',
      widthPercentage: textPercentage,
      colorClass: 'modality-text',
      title: 'Text Metadata',
    },
    {
      type: 'Image',
      widthPercentage: imagePercentage,
      colorClass: 'modality-image',
      title: 'Image Metadata',
    },
  ];
}

function buildModalityLegend({ textTokens, imageTokens }: BaseModalityTokens): TokenLegendItem[] {
  return [
    {
      type: 'Text',
      itemCssClass: 'modality-legend-item',
      itemDotCssClass: 'bg-input',
      token: textTokens,
      label: 'Text',
    },
    {
      type: 'Image',
      itemCssClass: 'modality-legend-item',
      itemDotCssClass: 'bg-output',
      token: imageTokens,
      label: 'Image',
    },
  ];
}

export function parseModalityDetails(details: ModalityTokenCount[] | undefined, totalTokens: number) {
  const textTokens = findModalityTokenCount(details, Modality.TEXT);
  const imageTokens = findModalityTokenCount(details, Modality.IMAGE);

  return {
    segments: buildModalitySegments({ textTokens, imageTokens, totalTokens }),
    legend: buildModalityLegend({ textTokens, imageTokens }),
  };
}

export function parseTokenDetails(tokenSummary: TokenSummary | undefined, totalTokenCount: number) {
  const promptTokens = tokenSummary?.promptTokenCount ?? 0;
  const candidatesTokens = tokenSummary?.outputTokenCount ?? 0;
  const cachedTokens = tokenSummary?.cachedContentTokenCount ?? 0;
  const thoughtTokens = tokenSummary?.thoughtsTokenCount ?? 0;

  const promptTokensPercentage = calculatePercentage(promptTokens, totalTokenCount);
  const outputTokensPercentage = calculatePercentage(candidatesTokens, totalTokenCount);
  const cachedTokensPercentage = calculatePercentage(cachedTokens, totalTokenCount);
  const thoughtTokensPercentage = calculatePercentage(thoughtTokens, totalTokenCount);
  const tokenUsageSegments: TokenSegment[] = [
    {
      type: 'prompt',
      widthPercentage: promptTokensPercentage,
      colorClass: 'segment-input',
      title: 'Input Tokens',
    },
    {
      type: 'output',
      widthPercentage: outputTokensPercentage,
      colorClass: 'segment-output',
      title: 'Output Tokens',
    },
    {
      type: 'cached',
      widthPercentage: cachedTokensPercentage,
      colorClass: 'segment-cached',
      title: 'Cached Tokens',
    },
    {
      type: 'thought',
      widthPercentage: thoughtTokensPercentage,
      colorClass: 'segment-thought',
      title: 'Thought Tokens',
    },
  ];

  const tokenUsageLegend: TokenLegendItem[] = [
    {
      type: 'prompt',
      itemCssClass: 'legend-item',
      itemDotCssClass: 'bg-input',
      token: promptTokens,
      label: 'Input',
    },
    {
      type: 'output',
      itemCssClass: 'legend-item',
      itemDotCssClass: 'bg-output',
      token: candidatesTokens,
      label: 'Output',
    },
    {
      type: 'cached',
      itemCssClass: 'legend-item',
      itemDotCssClass: 'bg-cached',
      token: cachedTokens,
      label: 'Cached',
    },
    {
      type: 'thought',
      itemCssClass: 'legend-item',
      itemDotCssClass: 'bg-thought',
      token: thoughtTokens,
      label: 'Thought',
    },
  ];

  return {
    segments: tokenUsageSegments,
    legend: tokenUsageLegend,
  };
}
