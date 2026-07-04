import { Component, input } from '@angular/core';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.html',
  styleUrl: './tag.css',
})
export class Tag {
  label = input.required<string>();
  tooltip = input<string>();
}
