import { Component } from '@angular/core';

@Component({
  selector: 'app-psychology-icon',
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
      <path
        d="M12 2a10 10 0 0 0-7.74 16.37C5.55 19.45 6 20.71 6 22h12c0-1.29.45-2.55 1.74-3.63A10 10 0 0 0 12 2zm0 18H8v-1.5c0-1.66 2.67-2.5 4-2.5s4 .84 4 2.5V20h-4zm6.05-3.65C17.38 17.5 16 18 12 18s-5.38-.5-6.05-1.65A8 8 0 1 1 18.05 16.35z"
      />
    </svg>
  `,
})
export class PsychologyIconComponent {}
