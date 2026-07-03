import { Component, input, signal, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-tab',
  standalone: true,
  templateUrl: './tab.html',
  styleUrl: './tab.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tab {
  id = input.required<string>();
  label = input.required<string>();
  active = signal(false);
}
