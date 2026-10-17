import { Component, computed, inject, input } from '@angular/core';
import { TAB_GROUP_CONTEXT } from './tab-group-context.const';

@Component({
  selector: 'app-tab',
  template: ` <div [class.hidden]="!isActive()">
    <ng-content>No content at the moment</ng-content>
  </div>`,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class TabComponent {
  id = input.required<string>();
  label = input.required<string>();
  readonly #tabGroup = inject(TAB_GROUP_CONTEXT);

  isActive = computed(() => this.id() === this.#tabGroup.activeTabId());
}
