import type { TokenSummary } from '@/core/firebase';
import type {
  ModalitySegmentsLegend,
  TokenLegendItem,
  TokenSegment,
} from '@/shared/ui/components/token-usage-bar/token-segment.type';
import { calculatePercentage } from '@/shared/utils/format.util';
import { Modality, type ModalityTokenCount } from 'firebase/ai';
import type { ModalitySegments } from './modality-segments.type';
import type { BaseModalityTokens, TokenUsageMetadata } from './token-analytics.interface';

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
      colorClass: 'bg-primary',
      title: 'Text Metadata',
    },
    {
      type: 'Image',
      widthPercentage: imagePercentage,
      colorClass: 'bg-secondary',
      title: 'Image Metadata',
    },
  ];
}

function buildModalityLegend({ textTokens, imageTokens }: BaseModalityTokens): TokenLegendItem[] {
  return [
    {
      type: 'Text',
      itemDotCssClass: 'bg-primary',
      token: textTokens,
      label: 'Text',
    },
    {
      type: 'Image',
      itemDotCssClass: 'bg-secondary',
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
      itemDotCssClass: 'bg-primary',
      token: promptTokens,
      label: 'Input',
    },
    {
      type: 'output',
      itemDotCssClass: 'bg-secondary',
      token: candidatesTokens,
      label: 'Output',
    },
    {
      type: 'cached',
      itemDotCssClass: 'bg-tertiary',
      token: cachedTokens,
      label: 'Cached',
    },
    {
      type: 'thought',
      itemDotCssClass: 'bg-quaternary',
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
      colorClass: 'bg-primary',
      title: 'Input Tokens',
    },
    {
      type: 'output',
      widthPercentage: outputTokensPercentage,
      colorClass: 'bg-secondary',
      title: 'Output Tokens',
    },
    {
      type: 'cached',
      widthPercentage: cachedTokensPercentage,
      colorClass: 'bg-tertiary',
      title: 'Cached Tokens',
    },
    {
      type: 'thought',
      widthPercentage: thoughtTokensPercentage,
      colorClass: 'bg-quaternary',
      title: 'Thought Tokens',
    },
  ];
  return tokenUsageSegments;
}
