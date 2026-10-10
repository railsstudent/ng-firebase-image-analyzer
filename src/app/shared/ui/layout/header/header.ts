import { NavService } from '@/core/services/nav.service';
import { NavLink } from '@/core/types/route.type';
import { TerminalIconComponent } from '@/shared/ui/icons/terminal-icon/terminal-icon.component';
import { Component, inject, input } from '@angular/core';
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
          <button class="nav-cta-btn" (click)="getStarted()">Get Started</button>
        </div>
      </div>
    </nav>
  `,
  styleUrl: './header.css',
})
export class Header {
  title = input('Home');
  navLinks = input<NavLink[]>([]);

  private readonly nav = inject(NavService);

  async getStarted(): Promise<void> {
    await this.nav.to('/image-analysis');
  }
}
