import { TAB_GROUP_CONTEXT } from '@/shared/ui/components/tab-group/constants/tab-group-context.const';
import { Component, computed, inject, input } from '@angular/core';

@Component({
  selector: 'app-tab',
  template: ` <div [class.hidden]="isInactive()">
    <ng-content>No content at the moment</ng-content>
  </div>`,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class Tab {
  id = input.required<string>();
  label = input.required<string>();
  tabGroup = inject(TAB_GROUP_CONTEXT);

  isInactive = computed(() => this.id() !== this.tabGroup.activeTabId());
}
