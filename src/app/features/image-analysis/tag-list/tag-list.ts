import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { Tag } from '../../../shared/ui/components/tag/tag';

export interface ImageTag {
  label: string;
  tooltip?: string;
}

@Component({
  selector: 'app-tag-list',
  standalone: true,
  imports: [Tag],
  templateUrl: './tag-list.html',
  styleUrl: './tag-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagList {
  tags = input.required<ImageTag[]>();
}
