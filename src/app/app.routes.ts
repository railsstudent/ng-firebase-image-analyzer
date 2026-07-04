import { Routes } from '@angular/router';
import { ROUTE_PATHS } from './core/types/route.types';

export const routes: Routes = [
  {
    path: ROUTE_PATHS.HOME,
    loadComponent: () => import('./features/home/home'),
  },
  {
    path: ROUTE_PATHS.IMAGE_ANALYSIS,
    loadComponent: () => import('./features/image-analysis/image-analysis'),
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
