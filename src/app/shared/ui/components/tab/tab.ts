import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-tab',
  templateUrl: './tab.html',
  styleUrl: './tab.css',
})
export class Tab {
  id = input.required<string>();
  label = input.required<string>();
  active = signal(false);
}
