import { Component, computed, input } from '@angular/core';
import { SkeletonVariant } from './skeleton-variant.type';

@Component({
  selector: 'app-skeleton',
  template: ` @for (i of lineArray(); track i) {
    <div [class]="getItemClasses(i)" aria-hidden="true"></div>
  }`,
  styleUrl: './skeleton.component.css',
})
export class SkeletonComponent {
  variant = input<SkeletonVariant>('line');
  lines = input(1);
  class = input('');

  lineArray = computed(() => Array.from({ length: Math.max(1, this.lines()) }, (_, i) => i));

  getItemClasses(index: number): string {
    const isMultiLine = this.variant() === 'line' && this.lines() > 1;
    const widthClass = isMultiLine && index === this.lines() - 1 ? 'w-3/4' : '';

    return `skeleton-primitive skeleton-${this.variant()} ${widthClass} ${this.class()}`.trim();
  }
}
