import { Routes } from '@angular/router';
import { ROUTE_PATHS } from './core/routing';
import HomeComponent from './features/home/home.component';

export const routes: Routes = [
  {
    path: ROUTE_PATHS.HOME,
    loadComponent: () => HomeComponent,
  },
  {
    path: ROUTE_PATHS.IMAGE_ANALYSIS,
    loadComponent: () => import('./features/image-analysis/image-analysis.component'),
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
