import { ExpandMoreIconComponent } from '@/shared/ui/icons/expand-more-icon/expand-more-icon.component';
import type { ElementRef } from '@angular/core';
import { afterRenderEffect, Component, computed, inject, input, output, viewChild } from '@angular/core';
import { ACCORDION_GROUP_CONTEXT } from './accordion-context.const';

@Component({
  selector: 'app-accordion-item',
  host: {
    class: 'block',
  },
  imports: [ExpandMoreIconComponent],
  templateUrl: './accordion-item.component.html',
  styleUrl: './accordion-item.component.css',
})
export class AccordionItemComponent {
  readonly #accordionGroup = inject(ACCORDION_GROUP_CONTEXT);
  readonly triggerButton = viewChild.required<ElementRef<HTMLButtonElement>>('triggerButton');

  id = input.required<string>();
  isDisabled = input(false);

  isExpanded = computed(() => this.#accordionGroup.isItemExpanded(this.id()));

  expandedChange = output<boolean>();

  constructor() {
    afterRenderEffect({
      write: () => {
        if (this.isExpanded()) {
          this.triggerButton().nativeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      },
    });
  }

  toggle(): void {
    if (this.isDisabled()) {
      return;
    }
    this.#accordionGroup.toggleItem(this.id());
    this.expandedChange.emit(this.isExpanded());
  }
}
