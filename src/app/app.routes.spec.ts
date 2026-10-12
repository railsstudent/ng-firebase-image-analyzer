import { createEnvironmentInjector, EnvironmentInjector, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { ConfigService } from './core/firebase';
import { ROUTE_PATHS } from './core/routing';
import HomeComponent from './features/home/home.component';

describe('app.routes', () => {
  let mockConfigService: Partial<ConfigService>;

  beforeEach(() => {
    mockConfigService = {
      initialize: vi.fn(),
    } satisfies Partial<ConfigService>;

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes),
        { provide: ConfigService, useValue: mockConfigService },
      ],
    });
  });

  describe('Route Definitions', () => {
    it('should configure /home without route-level providers (zero initialization)', () => {
      const homeRoute = routes.find((route) => route.path === ROUTE_PATHS.HOME);

      expect(homeRoute).toBeDefined();
      expect(homeRoute?.loadComponent).toBeDefined();
      expect(homeRoute?.loadComponent?.()).toBe(HomeComponent);
      expect(homeRoute?.providers).toBeUndefined();
    });

    it('should configure /image-analysis with deferred initialization provider and lazy component', () => {
      const imageAnalysisRoute = routes.find((route) => route.path === ROUTE_PATHS.IMAGE_ANALYSIS);

      expect(imageAnalysisRoute).toBeDefined();
      expect(imageAnalysisRoute?.loadComponent).toBeDefined();
      expect(imageAnalysisRoute?.providers).toBeDefined();
      expect(imageAnalysisRoute?.providers?.length).toBeGreaterThan(0);
    });

    it('should configure default and wildcard redirects to /home', () => {
      const emptyRoute = routes.find((route) => route.path === '');
      const wildcardRoute = routes.find((route) => route.path === '**');

      expect(emptyRoute).toMatchObject({
        path: '',
        redirectTo: ROUTE_PATHS.HOME,
        pathMatch: 'full',
      });
      expect(wildcardRoute).toMatchObject({
        path: '**',
        redirectTo: ROUTE_PATHS.HOME,
      });
    });
  });

  describe('Deferred Initialization Behavior', () => {
    it('should not initialize ConfigService when navigating to /home', async () => {
      const router = TestBed.inject(Router);
      await router.navigateByUrl(`/${ROUTE_PATHS.HOME}`);

      expect(mockConfigService.initialize).not.toHaveBeenCalled();
    });

    it('should initialize ConfigService when creating route injector for /image-analysis', () => {
      const imageAnalysisRoute = routes.find((route) => route.path === ROUTE_PATHS.IMAGE_ANALYSIS);
      const parentInjector = TestBed.inject(EnvironmentInjector);

      const providers = imageAnalysisRoute?.providers ?? [];
      createEnvironmentInjector(providers, parentInjector);

      expect(mockConfigService.initialize).toHaveBeenCalledTimes(1);
    });
  });
});
