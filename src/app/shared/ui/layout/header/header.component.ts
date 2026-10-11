import { AppLink, APP_NAV_LINKS } from '@/core/routing';
import { TerminalIconComponent } from '@/shared/ui/icons/terminal-icon/terminal-icon.component';
import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, TerminalIconComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  title = input('HomeComponent');
  navLinks = input<AppLink[]>(APP_NAV_LINKS);
}
