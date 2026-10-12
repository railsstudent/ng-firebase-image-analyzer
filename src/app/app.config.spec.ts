import { ErrorHandler, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, ROUTES } from '@angular/router';
import { SwRegistrationOptions } from '@angular/service-worker';
import { appConfig } from './app.config';
import { routes } from './app.routes';
import { AiService, ConfigService } from './core/firebase';

function hasProvider(token: unknown): boolean {
  return appConfig.providers.some(
    (p) => p === token || (typeof p === 'object' && p !== null && 'provide' in p && p.provide === token),
  );
}

describe('appConfig', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ...appConfig.providers],
    });
  });

  it('should not include any Firebase root providers', () => {
    expect(hasProvider(ConfigService)).toBe(false);
    expect(hasProvider(AiService)).toBe(false);
  });

  it('should configure router with application routes', () => {
    const router = TestBed.inject(Router, null);
    const configuredRoutes = TestBed.inject(ROUTES, null);

    expect(router).toBeTruthy();
    expect(configuredRoutes).toBeDefined();
    expect(configuredRoutes?.[0]).toEqual(routes);
  });

  it('should configure service worker registration options', () => {
    const swOptions = TestBed.inject(SwRegistrationOptions, null);

    expect(swOptions).toBeTruthy();
    expect(swOptions?.registrationStrategy).toBe('registerWhenStable:30000');
  });

  it('should provide global error listeners', () => {
    const errorHandler = TestBed.inject(ErrorHandler, null);
    expect(errorHandler).toBeTruthy();
  });
});
