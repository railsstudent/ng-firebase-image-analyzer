import type { AppLink } from '@/core/routing';
import { APP_NAV_LINKS, HOME_NAV_LINK } from '@/core/routing';
import { TerminalIconComponent } from '@/shared/ui/icons/terminal-icon/terminal-icon.component';
import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  host: {
    class: 'block sticky top-0 z-50',
  },
  imports: [RouterLink, RouterLinkActive, TerminalIconComponent],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  title = input('HomeComponent');
  homeLink = input<AppLink>(HOME_NAV_LINK);
  navLinks = input<AppLink[]>(APP_NAV_LINKS);
}
