import { inject, provideEnvironmentInitializer } from '@angular/core';
import type { Routes } from '@angular/router';
import { ConfigService } from './core/firebase/config.service';
import { ROUTE_PATHS } from './core/routing';
import HomeComponent from './features/home/home.component';

export const routes: Routes = [
  {
    path: ROUTE_PATHS.HOME,
    loadComponent: () => HomeComponent,
  },
  {
    path: ROUTE_PATHS.IMAGE_ANALYSIS,
    providers: [provideEnvironmentInitializer(() => inject(ConfigService).initialize())],
    loadComponent: () => import('./features/image-analysis/image-analysis.component'),
  },
  {
    path: ROUTE_PATHS.CULINARY_GUIDE,
    providers: [provideEnvironmentInitializer(() => inject(ConfigService).initialize())],
    loadComponent: () => import('./features/culinary-guide/culinary-guide.component'),
  },
  {
    path: '',
    redirectTo: ROUTE_PATHS.HOME,
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: ROUTE_PATHS.HOME,
  },
];
