import { TokenModalityBreakdown, TokenSummary } from '@/features/ai/types/token-usage.type';
import { parseModalityDetails, parseTokenDetails } from '@/features/image-analysis/utils/modality-segments.util';
import { TokenUsageBar } from '@/shared/ui/components/token-usage-bar/token-usage-bar';
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-token-analytics',
  imports: [TokenUsageBar],
  templateUrl: './token-analytics.html',
  styleUrl: './token-analytics.css',
})
export class TokenAnalytics {
  tokenSummary = input<TokenSummary | undefined>(undefined);
  tokenModalityBreakdown = input<TokenModalityBreakdown | undefined>(undefined);

  // Safe token counts extracted from response
  totalTokens = computed(() => this.tokenSummary()?.totalTokenCount ?? 0);
  promptTokens = computed(() => this.tokenSummary()?.promptTokenCount ?? 0);
  candidatesTokens = computed(() => this.tokenSummary()?.outputTokenCount ?? 0);
  cachedTokens = computed(() => this.tokenSummary()?.cachedContentTokenCount ?? 0);
  thoughtTokens = computed(() => this.tokenSummary()?.thoughtsTokenCount ?? 0);

  tokenDetails = computed(() => parseTokenDetails(this.tokenSummary(), this.totalTokens()));

  promptModalityDetails = computed(() =>
    parseModalityDetails(this.tokenModalityBreakdown()?.promptTokensDetails, this.promptTokens()),
  );

  outputModalityDetails = computed(() =>
    parseModalityDetails(this.tokenModalityBreakdown()?.outputTokensDetails, this.candidatesTokens()),
  );

  cachedModalityDetails = computed(() =>
    parseModalityDetails(this.tokenModalityBreakdown()?.cacheTokensDetails, this.cachedTokens()),
  );
}
