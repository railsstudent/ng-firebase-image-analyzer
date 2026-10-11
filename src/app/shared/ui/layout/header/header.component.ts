import { AppLink, APP_NAV_LINKS } from '@/core/routing';
import { TerminalIconComponent } from '@/shared/ui/icons/terminal-icon/terminal-icon.component';
import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, TerminalIconComponent],
  template: `
    <nav class="nav-bar">
      <div class="nav-container">
        <div class="nav-brand">
          <span class="nav-brand-title">
            <app-terminal-icon />
            {{ title() }}
          </span>
        </div>
        <div class="nav-links">
          @for (link of navLinks(); track link.path) {
            <a class="nav-link" routerLinkActive="nav-link-active" [routerLink]="link.path">
              {{ link.label }}
            </a>
          }
        </div>
        <div class="nav-actions">
          <a class="nav-cta-btn" routerLink="/image-analysis">Get Started</a>
        </div>
      </div>
    </nav>
  `,
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  title = input('HomeComponent');
  navLinks = input<AppLink[]>(APP_NAV_LINKS);
}
