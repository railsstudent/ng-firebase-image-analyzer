import { TabComponent } from '@/shared/ui/components/tab/tab.component';
import { Component, computed, contentChildren, signal } from '@angular/core';
import { TAB_GROUP_CONTEXT } from './tab-group-context.const';

@Component({
  selector: 'app-tab-group',
  templateUrl: './tab-group.component.html',
  styleUrl: './tab-group.component.css',
  providers: [{ provide: TAB_GROUP_CONTEXT, useExisting: TabGroupComponent }],
})
export class TabGroupComponent {
  tabs = contentChildren(TabComponent);
  readonly #userSelectedTabId = signal<string | null>(null);

  activeTabId = computed(() => {
    const id = this.#userSelectedTabId();

    if (this.tabs().length <= 0) {
      return null;
    }

    if (id && this.tabs().some((tab) => tab.id() === id)) {
      return id;
    }

    return this.tabs()[0].id();
  });

  selectTab(id: string): void {
    this.#userSelectedTabId.set(id);
  }
}
