import { StreamingCulinaryDiscoveryWithMetadata } from '@/core/culinary-guide';

export const DEFAULT_DISCOVERY_DATA: StreamingCulinaryDiscoveryWithMetadata = {
  foods: [],
  honorableMentions: [],
  thoughtSummary: '',
  displaySource: 'Unknown',
  source: 'on_device',
  tokenSummary: {
    totalTokenCount: 0,
    promptTokenCount: 0,
    thoughtsTokenCount: 0,
    cachedContentTokenCount: 0,
    outputTokenCount: 0,
  },
  tokenModalityBreakdown: {
    promptTokensDetails: [],
    outputTokensDetails: [],
    cacheTokensDetails: [],
  },
};
