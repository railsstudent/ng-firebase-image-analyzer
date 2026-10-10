import { Component, input } from '@angular/core';
import { RecommendationList } from '@/shared/ui/components/recommendation-list/recommendation-list';
import { RecommendationItem } from '@/shared/ui/components/recommendation-item/recommendation-item';
import { PsychologyIconComponent } from '@/shared/ui/icons/psychology-icon/psychology-icon.component';

@Component({
  selector: 'app-thought-summary',
  imports: [RecommendationList, RecommendationItem, PsychologyIconComponent],
  templateUrl: './thought-summary.html',
  styleUrl: './thought-summary.css',
})
export class ThoughtSummary {
  displaySource = input('N/A');
  thoughtSummary = input('No technical logs provided.');
  alternativeTexts = input<string[] | undefined>(undefined);
}
