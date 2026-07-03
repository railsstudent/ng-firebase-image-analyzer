import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-tag',
  standalone: true,
  templateUrl: './tag.html',
  styleUrl: './tag.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tag {
  label = input.required<string>();
  tooltip = input<string>();
}
