import { Component } from '@angular/core';

@Component({
  selector: 'app-sell-icon',
  host: {
    class: 'app-icon size-5 text-primary text-2xl',
  },
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        d="M21.41 11.41l-8.83-8.83C12.21 2.21 11.7 2 11.17 2H4c-1.1 0-2 .9-2 2v7.17c0 .53.21 1.04.59 1.41l8.83 8.83c.78.78 2.05.78 2.83 0l6.17-6.17c.78-.78.78-2.05 0-2.83zM6.5 8C5.67 8 5 7.33 5 6.5S5.67 5 6.5 5 8 5.67 8 6.5 7.33 8 6.5 8z"
      />
    </svg>
  `,
})
export class SellIconComponent {}
