import { Component, contentChildren, effect, signal, output, ChangeDetectionStrategy } from '@angular/core';
import { Tab } from '../tab/tab';

@Component({
  selector: 'app-tab-group',
  standalone: true,
  templateUrl: './tab-group.html',
  styleUrl: './tab-group.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabGroup {
  tabs = contentChildren(Tab);
  activeTabId = signal<string | null>(null);
  tabChange = output<string>();

  constructor() {
    // Automatically select the first tab if none are active
    effect(() => {
      const currentTabs = this.tabs();
      const currentActiveId = this.activeTabId();

      if (currentTabs.length > 0) {
        if (!currentActiveId || !currentTabs.some((t) => t.id() === currentActiveId)) {
          this.selectTab(currentTabs[0].id());
        } else {
          // Keep active states synchronized
          currentTabs.forEach((t) => t.active.set(t.id() === currentActiveId));
        }
      }
    });
  }

  selectTab(id: string) {
    this.activeTabId.set(id);
    this.tabChange.emit(id);
    this.tabs().forEach((t) => t.active.set(t.id() === id));
  }
}
