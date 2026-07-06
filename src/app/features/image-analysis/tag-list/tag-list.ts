import { Badge } from '@/shared/ui/components/badge/badge';
import { Component, input } from '@angular/core';
import { ImageTag } from './types/image-tag.type';

@Component({
  selector: 'app-tag-list',
  imports: [Badge],
  templateUrl: './tag-list.html',
  styleUrl: './tag-list.css',
})
export class TagList {
  tags = input.required<ImageTag[]>();
}
