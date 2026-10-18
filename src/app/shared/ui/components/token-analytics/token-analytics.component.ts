import { TokenModalityBreakdown, TokenSummary } from '@/core/firebase';
import { ListSkeletonComponent } from '@/shared/ui/components/skeleton';
import { TokenUsageBarComponent } from '@/shared/ui/components/token-usage-bar/token-usage-bar.component';
import { BarChartIconComponent } from '@/shared/ui/icons/bar-chart-icon/bar-chart-icon.component';
import { Component, computed, input } from '@angular/core';
import { parseModalityDetails, parseTokenDetails } from './token-analytics.util';

@Component({
  selector: 'app-token-analytics',
  imports: [TokenUsageBarComponent, BarChartIconComponent, ListSkeletonComponent],
  templateUrl: './token-analytics.component.html',
  styleUrls: ['../../styles/section-card.css', './token-analytics.component.css'],
})
export class TokenAnalyticsComponent {
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
