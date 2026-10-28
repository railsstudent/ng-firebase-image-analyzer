import { RecommendationItemComponent } from '@/shared/ui/components/recommendation-list/recommendation-item.component';
import { RecommendationListComponent } from '@/shared/ui/components/recommendation-list/recommendation-list.component';
import { ListSkeletonComponent } from '@/shared/ui/components/skeleton/list-skeleton.component';
import { PsychologyIconComponent } from '@/shared/ui/icons/psychology-icon/psychology-icon.component';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-thought-summary',
  imports: [RecommendationListComponent, RecommendationItemComponent, PsychologyIconComponent, ListSkeletonComponent],
  templateUrl: './thought-summary.component.html',
})
export class ThoughtSummaryComponent {
  displaySource = input('N/A');
  thoughtSummary = input('No technical logs provided.');
  remarks = input<string[] | undefined>(undefined);
  remarksTitle = input('Remarks & Observations');
}
