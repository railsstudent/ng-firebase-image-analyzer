import type { StreamingCulinaryDiscoveryWithMetadata } from '@/core/culinary-guide';
import { ListSkeletonComponent } from '@/shared/ui/components/skeleton/list-skeleton.component';
import { TabGroupComponent } from '@/shared/ui/components/tab-group/tab-group.component';
import { TabComponent } from '@/shared/ui/components/tab-group/tab.component';
import { ThoughtSummaryComponent } from '@/shared/ui/components/thought-summary/thought-summary.component';
import { TokenAnalyticsComponent } from '@/shared/ui/components/token-analytics/token-analytics.component';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-culinary-discovery-panel',
  imports: [TabGroupComponent, TabComponent, TokenAnalyticsComponent, ThoughtSummaryComponent, ListSkeletonComponent],
  templateUrl: './culinary-discovery-panel.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  styleUrls: ['../../../shared/ui/styles/section-card.css', '../../../shared/ui/styles/empty-state.css'],
})
export class CulinaryDiscoveryPanelComponent {
  discovery = input<StreamingCulinaryDiscoveryWithMetadata | null>(null);
}
