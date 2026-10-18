import { Component } from '@angular/core';
import { SkeletonComponent } from './skeleton.component';

@Component({
  selector: 'app-list-skeleton',
  imports: [SkeletonComponent],
  template: ` <div class="space-y-4 py-3" aria-hidden="true">
    @for (i of [1, 2, 3]; track i) {
      <div class="flex gap-4">
        <app-skeleton variant="circle" class="h-6 w-6 shrink-0" />
        <div class="flex-1 space-y-2 py-1">
          <app-skeleton variant="line" class="w-1/3" />
          <app-skeleton variant="line" class="w-5/6" />
        </div>
      </div>
    }
  </div>`,
})
export class ListSkeletonComponent {}
