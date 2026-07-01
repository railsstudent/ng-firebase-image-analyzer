import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-header',
  template: `
    <div class="header-container">
      <h1 class="header-title">{{ title() }}</h1>
    </div>
  `,
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  title = input('Home');
}
