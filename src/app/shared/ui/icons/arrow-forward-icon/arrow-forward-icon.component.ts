import { Component } from '@angular/core';

@Component({
  selector: 'app-arrow-forward-icon',
  host: {
    class: 'inline-flex items-center justify-center shrink-0 w-5 h-5 select-none',
  },
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="w-full h-full"
      aria-hidden="true"
    >
      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
    </svg>
  `,
})
export class ArrowForwardIconComponent {}
