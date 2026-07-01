import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'image-analysis',
    loadComponent: () => import('./features/image-analysis/image-analysis'),
  },
  {
    path: '',
    redirectTo: 'image-analysis',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'image-analysis',
  },
];
