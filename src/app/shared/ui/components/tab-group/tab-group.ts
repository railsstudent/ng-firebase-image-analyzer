import { Component, computed, contentChildren, signal } from '@angular/core';
import { Tab } from '../tab/tab';
import { TAB_GROUP_CONTEXT } from './constants/tab-group-context.const';

@Component({
  selector: 'app-tab-group',
  templateUrl: './tab-group.html',
  styleUrl: './tab-group.css',
  providers: [{ provide: TAB_GROUP_CONTEXT, useExisting: TabGroup }],
})
export class TabGroup {
  tabs = contentChildren(Tab);
  private selectedTabId = signal<string | null>(null);

  activeTabId = computed(() => {
    const id = this.selectedTabId();

    if (this.tabs().length <= 0) {
      return null;
    }

    if (id && this.tabs().some((tab) => tab.id() === id)) {
      return id;
    }

    return this.tabs()[0].id();
  });

  selectTab(id: string) {
    this.selectedTabId.set(id);
  }
}
