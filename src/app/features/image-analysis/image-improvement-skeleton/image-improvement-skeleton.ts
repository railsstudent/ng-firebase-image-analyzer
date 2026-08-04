import { Component } from '@angular/core';

@Component({
  selector: 'app-image-improvement-skeleton',
  template: `<div class="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
    <div class="skeleton-block h-48"></div>
    <div class="space-y-4">
      <div class="skeleton-line h-6 w-1/2"></div>
      <div class="skeleton-line w-5/6"></div>
      <div class="skeleton-line w-2/3"></div>
    </div>
  </div>`,
})
export class ImageImprovementSkeleton {}
