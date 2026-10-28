import { TerminalIconComponent } from '@/shared/ui/icons/terminal-icon/terminal-icon.component';
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [TerminalIconComponent],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  copyrightYear = new Date(Date.now()).getFullYear();
}
