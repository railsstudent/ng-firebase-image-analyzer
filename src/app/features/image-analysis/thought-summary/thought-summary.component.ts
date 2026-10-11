import { Component, input } from '@angular/core';
import { RecommendationListComponent } from '@/shared/ui/components/recommendation-list/recommendation-list.component';
import { RecommendationItemComponent } from '@/shared/ui/components/recommendation-item/recommendation-item.component';
import { PsychologyIconComponent } from '@/shared/ui/icons/psychology-icon/psychology-icon.component';

@Component({
  selector: 'app-thought-summary',
  imports: [RecommendationListComponent, RecommendationItemComponent, PsychologyIconComponent],
  templateUrl: './thought-summary.component.html',
  styleUrls: [
    '../../../shared/ui/styles/section-card.css',
    '../../../shared/ui/styles/skeleton.css',
    './thought-summary.component.css',
  ],
})
export class ThoughtSummaryComponent {
  displaySource = input('N/A');
  thoughtSummary = input('No technical logs provided.');
  alternativeTexts = input<string[] | undefined>(undefined);
}
