import { TokenSummary } from '@/core/firebase';
import {
  TokenSegment,
  TokenLegendItem,
  ModalitySegmentsLegend,
} from '@/shared/ui/components/token-usage-bar/token-segment.type';
import { Modality, ModalityTokenCount } from 'firebase/ai';
import { ModalitySegments } from './modality-segments.type';
import { BaseModalityTokens, TokenUsageMetadata } from './token-analytics.interface';

function calculatePercentage(value: number, total: number): number {
  const percent = 100;

  if (total === 0) {
    return 0;
  }
  return (value / total) * percent;
}

function findModalityTokenCount(tokenDetails: ModalityTokenCount[] | undefined, modality: Modality): number {
  const textDetail = tokenDetails?.find((d) => d.modality === modality);

  return textDetail?.tokenCount ?? 0;
}

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

export function parseModalityDetails(
  details: ModalityTokenCount[] | undefined,
  totalTokens: number,
): ModalitySegmentsLegend {
  const textTokens = findModalityTokenCount(details, Modality.TEXT);
  const imageTokens = findModalityTokenCount(details, Modality.IMAGE);

  return {
    segments: buildModalitySegments({ textTokens, imageTokens, totalTokens }),
    legend: buildModalityLegend({ textTokens, imageTokens }),
  };
}

export function parseTokenDetails(
  tokenSummary: TokenSummary | undefined,
  totalTokenCount: number,
): ModalitySegmentsLegend {
  const promptTokens = tokenSummary?.promptTokenCount ?? 0;
  const candidatesTokens = tokenSummary?.outputTokenCount ?? 0;
  const cachedTokens = tokenSummary?.cachedContentTokenCount ?? 0;
  const thoughtTokens = tokenSummary?.thoughtsTokenCount ?? 0;

  const tokenMetadata = { promptTokens, totalTokenCount, candidatesTokens, cachedTokens, thoughtTokens };
  const tokenUsageSegments = getTokenUsageSegments(tokenMetadata);
  const tokenUsageLegend = getTokenUsageLegend(tokenMetadata);

  return {
    segments: tokenUsageSegments,
    legend: tokenUsageLegend,
  };
}

function getTokenUsageLegend(metadata: TokenUsageMetadata): TokenLegendItem[] {
  const { promptTokens, candidatesTokens, cachedTokens, thoughtTokens } = metadata;
  return [
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
}

function getTokenUsageSegments({
  promptTokens,
  totalTokenCount,
  candidatesTokens,
  cachedTokens,
  thoughtTokens,
}: TokenUsageMetadata): TokenSegment[] {
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
  return tokenUsageSegments;
}
