import { RecommendationItemComponent } from '@/shared/ui/components/recommendation-item/recommendation-item.component';
import { RecommendationListComponent } from '@/shared/ui/components/recommendation-list/recommendation-list.component';
import { SkeletonComponent } from '@/shared/ui/components/skeleton';
import { PsychologyIconComponent } from '@/shared/ui/icons/psychology-icon/psychology-icon.component';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-thought-summary',
  imports: [RecommendationListComponent, RecommendationItemComponent, PsychologyIconComponent, SkeletonComponent],
  templateUrl: './thought-summary.component.html',
  styleUrls: ['../../styles/section-card.css', './thought-summary.component.css'],
})
export class ThoughtSummaryComponent {
  displaySource = input('N/A');
  thoughtSummary = input('No technical logs provided.');
  remarks = input<string[] | undefined>(undefined);
  remarksTitle = input('Remarks & Observations');
}
