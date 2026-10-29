import { Component } from '@angular/core';

@Component({
  selector: 'app-terminal-icon',
  host: {
    class: 'app-icon size-5',
  },
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zm-9.5-3.5l-1.41-1.41L11.67 12 9.09 9.41 10.5 8l4 4-4 4zm3.5.5h4v2h-4v-2z"
      />
    </svg>
  `,
})
export class TerminalIconComponent {}
