import { Routes } from '@angular/router';
import { ROUTE_PATHS } from './core/types/route.type';
import Home from './features/home/home';

export const routes: Routes = [
  {
    path: ROUTE_PATHS.HOME,
    loadComponent: () => Home,
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
