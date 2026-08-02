import { Component } from '@angular/core';

@Component({
  selector: 'app-image-recommendation-skeleton',
  template: `<div class="animate-pulse space-y-4 py-3">
    <div class="flex gap-4">
      <div class="skeleton-circle"></div>
      <div class="flex-1 space-y-2 py-1">
        <div class="skeleton-line w-1/4"></div>
        <div class="skeleton-line w-5/6"></div>
      </div>
    </div>
    <div class="flex gap-4">
      <div class="skeleton-circle"></div>
      <div class="flex-1 space-y-2 py-1">
        <div class="skeleton-line w-1/3"></div>
        <div class="skeleton-line w-3/4"></div>
      </div>
    </div>
    <div class="flex gap-4">
      <div class="skeleton-circle"></div>
      <div class="flex-1 space-y-2 py-1">
        <div class="skeleton-line w-1/4"></div>
        <div class="skeleton-line w-5/6"></div>
      </div>
    </div>
  </div>`,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class ImageRecommendationSkeleton {}
