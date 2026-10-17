import { Component, model, signal } from '@angular/core';
import { ACCORDION_GROUP_CONTEXT } from './accordion-context.const';

@Component({
  selector: 'app-accordion-group',
  templateUrl: './accordion-group.component.html',
  styleUrl: './accordion-group.component.css',
  providers: [{ provide: ACCORDION_GROUP_CONTEXT, useExisting: AccordionGroupComponent }],
})
export class AccordionGroupComponent {
  readonly isMulti = signal(false);
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
