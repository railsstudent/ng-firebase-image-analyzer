import { Component, input, model } from '@angular/core';
import { ACCORDION_GROUP_CONTEXT } from './accordion-context.const';

@Component({
  selector: 'app-accordion-group',
  host: {
    class: 'block',
  },
  template: ` <div class="flex flex-col gap-3">
    <ng-content />
  </div>`,
  providers: [{ provide: ACCORDION_GROUP_CONTEXT, useExisting: AccordionGroupComponent }],
})
export class AccordionGroupComponent {
  readonly isMulti = input(false);
  readonly expandedIds = model<string[]>([]);

  isItemExpanded(id: string): boolean {
    return this.expandedIds().includes(id);
  }

  toggleItem(id: string): void {
    if (this.isMulti()) {
      this.expandedIds.update((ids) => {
        if (this.isItemExpanded(id)) {
          return ids.filter((itemId) => itemId !== id);
        } else {
          return [...ids, id];
        }
      });
    } else {
      this.expandedIds.set(this.isItemExpanded(id) ? [] : [id]);
    }
  }

  collapseAll(): void {
    this.expandedIds.set([]);
  }
}
