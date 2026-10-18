import { SkeletonComponent } from '@/shared/ui/components/skeleton';
import { Component } from '@angular/core';

@Component({
  selector: 'app-image-improvement-skeleton',
  imports: [SkeletonComponent],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 py-4" aria-hidden="true">
      <app-skeleton variant="rect" class="h-48" />
      <div class="space-y-4">
        <app-skeleton variant="line" class="h-6 w-1/2" />
        <app-skeleton variant="line" class="w-5/6" />
        <app-skeleton variant="line" class="w-2/3" />
      </div>
    </div>
  `,
})
export class ImageImprovementSkeletonComponent {}
