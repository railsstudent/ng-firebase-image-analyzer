import { Tag } from '@/shared/ui/components/tag/tag';
import { Component, input } from '@angular/core';
import { ImageTag } from './types/image-tag.type';

@Component({
  selector: 'app-tag-list',
  imports: [Tag],
  templateUrl: './tag-list.html',
  styleUrl: './tag-list.css',
})
export class TagList {
  tags = input.required<ImageTag[]>();
}
