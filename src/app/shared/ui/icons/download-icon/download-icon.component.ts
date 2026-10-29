import { Component } from '@angular/core';

@Component({
  selector: 'app-download-icon',
  host: {
    class: 'app-icon size-5',
  },
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="size-full"
      aria-hidden="true"
    >
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
    </svg>
  `,
})
export class DownloadIconComponent {}
