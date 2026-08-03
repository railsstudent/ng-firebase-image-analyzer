import { Component } from '@angular/core';

const ODD_ROW_CLASSES = ['w-1/4', 'w-5/6'];
const EVEN_ROW_CLASSES = ['w-1/3', 'w-3/4'];

@Component({
  selector: 'app-image-recommendation-skeleton',
  template: `<div class="animate-pulse space-y-4 py-3">
    @for (widthClasses of rowWidthStyles; track $index) {
      <div class="flex gap-4">
        <div class="skeleton-circle"></div>
        <div class="flex-1 space-y-2 py-1">
          @for (widthClass of widthClasses; track widthClass) {
            <div class="skeleton-line {{ widthClass }}"></div>
          }
        </div>
      </div>
    }
  </div>`,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class ImageRecommendationSkeleton {
  readonly rowWidthStyles = [ODD_ROW_CLASSES, EVEN_ROW_CLASSES, ODD_ROW_CLASSES];
}
