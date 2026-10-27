import { Component } from '@angular/core';

@Component({
  selector: 'app-photo-filter-icon',
  host: {
    class: 'inline-flex items-center justify-center shrink-0 w-5 h-5 select-none text-primary text-2xl',
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
        d="M19 10H5V8h14v2zm0 2H5v2h14v-2zm0-6H5v2h14V6zM5 18h14v-2H5v2zm14-16H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"
      />
    </svg>
  `,
})
export class PhotoFilterIconComponent {}
