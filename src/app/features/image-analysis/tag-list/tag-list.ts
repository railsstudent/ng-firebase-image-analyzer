import { Badge } from '@/shared/ui/components/badge/badge';
import { SellIconComponent } from '@/shared/ui/icons/sell-icon/sell-icon.component';
import { Component, input } from '@angular/core';
import { ImageTag } from './types/image-tag.type';

@Component({
  selector: 'app-tag-list',
  imports: [Badge, SellIconComponent],
  templateUrl: './tag-list.html',
  styleUrl: './tag-list.css',
})
export class TagList {
  tags = input.required<ImageTag[]>();
}
