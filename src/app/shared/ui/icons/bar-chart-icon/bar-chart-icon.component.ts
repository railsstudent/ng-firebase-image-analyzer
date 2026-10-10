import { Component } from '@angular/core';

@Component({
  selector: 'app-bar-chart-icon',
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="w-full h-full"
      aria-hidden="true"
    >
      <path d="M5 9.2h3V19H5zM10.6 5h3v14h-3zm5.6 8h3v6h-3z" />
    </svg>
  `,
  styleUrl: '../icon.css',
})
export class BarChartIconComponent {}
