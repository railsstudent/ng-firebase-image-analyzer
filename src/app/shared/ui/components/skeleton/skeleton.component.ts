import { Component, computed, input } from '@angular/core';
import type { SkeletonVariant } from './skeleton-variant.type';

@Component({
  selector: 'app-skeleton',
  host: {
    class: 'flex flex-col gap-2',
  },
  template: ` @for (itemClass of itemClasses(); track itemClass.id) {
    <div [class]="itemClass.itemClass" aria-hidden="true"></div>
  }`,
  styleUrl: './skeleton.component.css',
})
export class SkeletonComponent {
  variant = input<SkeletonVariant>('line');
  lines = input(1);
  class = input('');

  itemClasses = computed(() => {
    const count = Math.max(1, this.lines());
    const isMultiLine = this.variant() === 'line' && count > 1;

    return Array.from({ length: count }, (_, index) => {
      const widthClass = isMultiLine && index === count - 1 ? 'w-3/4' : '';
      const itemClass = `skeleton-primitive skeleton-${this.variant()} ${widthClass} ${this.class()}`.trim();
      return { id: index, itemClass };
    });
  });
}
