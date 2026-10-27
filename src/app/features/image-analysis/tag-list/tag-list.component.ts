import { BadgeComponent } from '@/shared/ui/components/badge/badge.component';
import { Component, input } from '@angular/core';
import type { ImageTag } from './interfaces/image-tag.interface';

@Component({
  selector: 'app-tag-list',
  host: {
    style: 'display: block',
  },
  imports: [BadgeComponent],
  templateUrl: './tag-list.component.html',
  styleUrls: ['../../../shared/ui/styles/empty-state.css'],
})
export class TagListComponent {
  tags = input.required<ImageTag[]>();
}
