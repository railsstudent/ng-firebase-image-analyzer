import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-tab',
  template: ` <div [class.hidden]="!active()">
    <ng-content></ng-content>
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
  active = signal(false);
}
