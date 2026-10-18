import { Component, computed, input } from '@angular/core';
import { SkeletonVariant } from './skeleton-variant.type';

@Component({
  selector: 'app-skeleton',
  template: ` @for (itemClass of itemClasses(); track itemClass) {
    <div [class]="itemClass" aria-hidden="true"></div>
  }`,
  styleUrl: './skeleton.component.css',
})
export class SkeletonComponent {
  variant = input<SkeletonVariant>('line');
  lines = input(1);
  class = input('');

  lineArray = computed(() => Array.from({ length: Math.max(1, this.lines()) }, (_, i) => i));

  itemClasses = computed(() => {
    const count = Math.max(1, this.lines());
    const isMultiLine = this.variant() === 'line' && count > 1;

    return Array.from({ length: count }, (_, index) => {
      let widthClass = '';
      if (isMultiLine) {
        if (count === 2) {
          widthClass = index === 0 ? 'w-3/4' : 'w-1/2';
        } else if (index === count - 1) {
          widthClass = 'w-3/4';
        }
      }

      return `skeleton-primitive skeleton-${this.variant()} ${widthClass} ${this.class()}`.trim();
    });
  });
}
