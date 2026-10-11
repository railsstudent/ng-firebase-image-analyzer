import { TerminalIconComponent } from '@/shared/ui/icons/terminal-icon/terminal-icon.component';
import { Component, computed } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [TerminalIconComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  copyrightYear = computed(() => new Date(Date.now()).getFullYear());
}
