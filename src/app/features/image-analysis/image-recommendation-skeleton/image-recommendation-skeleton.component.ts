import { Component } from '@angular/core';

const ODD_ROW_CLASSES = ['w-1/4', 'w-5/6'];
const EVEN_ROW_CLASSES = ['w-1/3', 'w-3/4'];

@Component({
  selector: 'app-image-recommendation-skeleton',
  templateUrl: './image-recommendation-skeleton.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  styleUrls: ['../../../shared/ui/styles/skeleton.css'],
})
export class ImageRecommendationSkeletonComponent {
  readonly rowWidthStyles = [ODD_ROW_CLASSES, EVEN_ROW_CLASSES, ODD_ROW_CLASSES];
}
