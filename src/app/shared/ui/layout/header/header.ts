import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

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
          <a class="nav-link" routerLinkActive="nav-link-active" routerLink="/home">Home</a>
          <a class="nav-link" routerLinkActive="nav-link-active" routerLink="/image-analysis">Inference</a>
        </div>
        <div class="nav-actions">
          <button class="nav-cta-btn" (click)="navigateTo('/image-analysis')">Get Started</button>
        </div>
      </div>
    </nav>
  `,
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  title = input('Home');

  router = inject(Router);

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
