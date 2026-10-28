import { Component, computed, input } from '@angular/core';
import type { SkeletonVariant } from './skeleton-variant.type';

const VARIANT_CLASSES: Record<SkeletonVariant, string> = {
  line: 'h-4 rounded',
  circle: 'rounded-full aspect-square',
  rect: 'rounded-lg w-full h-full',
};

@Component({
  selector: 'app-skeleton',
  host: {
    class: 'flex flex-col gap-2',
  },
  template: ` @for (itemClass of itemClasses(); track itemClass.id) {
    <div class="bg-skeleton animate-pulse" [class]="itemClass.itemClass" aria-hidden="true"></div>
  }`,
})
export class SkeletonComponent {
  variant = input<SkeletonVariant>('line');
  lines = input(1);
  class = input('');

  itemClasses = computed(() => {
    const count = Math.max(1, this.lines());
    const variant = this.variant();
    const isMultiLine = variant === 'line' && count > 1;

    return Array.from({ length: count }, (_, index) => {
      const widthClass = isMultiLine && index === count - 1 ? 'w-3/4' : '';
      const itemClass = `${VARIANT_CLASSES[variant]} ${widthClass} ${this.class()}`.trim();
      return { id: index, itemClass };
    });
  });
}
