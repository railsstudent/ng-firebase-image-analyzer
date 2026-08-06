import { NAVIGATOR, WINDOW } from '@/core/constants/navigator.const';
import firebaseConfig from '@/public/firebase.config.json';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config.service';

/* eslint-disable @typescript-eslint/no-explicit-any */
describe('ConfigService', () => {
  let service: ConfigService;
  let mockNavigator: { onLine: boolean };
  let mockWindow: { location: { hostname: string } };
  let originalAppCheckDebugToken: string;

  beforeEach(() => {
    // Store original token to restore after each test
    originalAppCheckDebugToken = firebaseConfig.appCheckDebugToken;

    // Create mocks for injected services using Vitest mocks
    mockNavigator = { onLine: true };
    mockWindow = {
      location: {
        hostname: 'localhost',
      },
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ConfigService,
        { provide: NAVIGATOR, useValue: mockNavigator },
        { provide: WINDOW, useValue: mockWindow },
      ],
    });

    service = TestBed.inject(ConfigService);

    // Spy on protected helper methods on the service instance to prevent actual Firebase SDK network calls
    vi.spyOn(service as any, 'initializeFirebaseApp').mockReturnValue({} as any);
    vi.spyOn(service as any, 'initializeAppCheckInstance').mockReturnValue({} as any);
    vi.spyOn(service as any, 'getRemoteConfigInstance').mockReturnValue({
      settings: {},
    } as any);
    vi.spyOn(service as any, 'fetchRemoteConfig').mockResolvedValue(true);
  });

  afterEach(() => {
    // Restore original config value to prevent cross-test leakage
    firebaseConfig.appCheckDebugToken = originalAppCheckDebugToken;
    delete (globalThis as any).FIREBASE_APPCHECK_DEBUG_TOKEN;
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('App Check Sandbox Mode Verification', () => {
    it('should assign custom App Check debug token in Locked Mode when it is defined', async () => {
      // Arrange
      firebaseConfig.appCheckDebugToken = 'my-custom-persistent-token';
      mockNavigator.onLine = true;

      // Act
      await service.initialize();

      // Assert
      expect((globalThis as any).FIREBASE_APPCHECK_DEBUG_TOKEN).toBe('my-custom-persistent-token');
    });

    it('should fallback to Transient Mode (isDevMode() or isLocalhost) when appCheckDebugToken is empty', async () => {
      // Arrange
      firebaseConfig.appCheckDebugToken = '';
      mockNavigator.onLine = true;
      mockWindow.location.hostname = 'localhost'; // Guarantees isLocalhost is true

      // Act
      await service.initialize();

      // Assert
      // Since isLocalhost is true, FIREBASE_APPCHECK_DEBUG_TOKEN should evaluate to true
      expect((globalThis as any).FIREBASE_APPCHECK_DEBUG_TOKEN).toBe(true);
    });
  });
});
