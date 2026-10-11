import { BadgeComponent } from '@/shared/ui/components/badge/badge.component';
import { SellIconComponent } from '@/shared/ui/icons/sell-icon/sell-icon.component';
import { Component, input } from '@angular/core';
import { ImageTag } from './interfaces/image-tag.interface';

@Component({
  selector: 'app-tag-list',
  imports: [BadgeComponent, SellIconComponent],
  templateUrl: './tag-list.component.html',
  styleUrl: './tag-list.component.css',
})
export class TagListComponent {
  tags = input.required<ImageTag[]>();
}
