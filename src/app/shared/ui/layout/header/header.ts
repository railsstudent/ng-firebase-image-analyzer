import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavLink } from '@/core/types/route.types';
import { NavService } from '@/core/services/nav.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="nav-bar">
      <div class="nav-container">
        <div class="nav-brand">
          <span class="nav-brand-title">
            <span class="material-symbols-outlined">terminal</span>
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  title = input('Home');
  navLinks = input<NavLink[]>([]);

  private readonly nav = inject(NavService);

  getStarted() {
    this.nav.to('/image-analysis');
  }
}
