import { inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { AppRoute, NavLink } from '../types/route.types';

@Service()
export class NavService {
  private readonly router = inject(Router);

  // Central config for top-level navigation links
  readonly links: NavLink[] = [
    { label: 'Home', path: '/home' },
    { label: 'Inference', path: '/image-analysis' },
  ];

  /**
   * Type-safe programmatic navigation to any registered AppRoute.
   */
  to(route: AppRoute): Promise<boolean> {
    return this.router.navigate([route]);
  }
}
