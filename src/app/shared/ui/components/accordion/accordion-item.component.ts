import { ExpandMoreIconComponent } from '@/shared/ui/icons/expand-more-icon/expand-more-icon.component';
import { Component, computed, inject, input, output } from '@angular/core';
import { ACCORDION_GROUP_CONTEXT } from './accordion-context.const';

@Component({
  selector: 'app-accordion-item',
  imports: [ExpandMoreIconComponent],
  templateUrl: './accordion-item.component.html',
  styleUrl: './accordion-item.component.css',
})
export class AccordionItemComponent {
  readonly #accordionGroup = inject(ACCORDION_GROUP_CONTEXT);

  id = input.required<string>();
  isExpanded = computed(() => this.#accordionGroup.isItemExpanded(this.id()));

  expandedChange = output<boolean>();

  toggle(): void {
    this.#accordionGroup.toggleItem(this.id());
    this.expandedChange.emit(this.isExpanded());
  }
}
