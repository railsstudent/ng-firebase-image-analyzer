import { WINDOW } from '@/core/constants/navigator.const';
import { ConnectionService } from '@/core/services/connection.service';
import firebaseConfig from '@/public/firebase.config.json';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config.service';

/* eslint-disable @typescript-eslint/no-explicit-any */
describe('ConfigService', () => {
  let service: ConfigService;
  let connectionServiceSpy: jasmine.SpyObj<ConnectionService>;
  let mockWindow: { location: { hostname: string } };
  let originalAppCheckDebugToken: string;

  beforeEach(() => {
    // Store original token to restore after each test
    originalAppCheckDebugToken = firebaseConfig.appCheckDebugToken;

    // Create mocks for injected services
    connectionServiceSpy = jasmine.createSpyObj('ConnectionService', ['getOnlineStatus']);
    mockWindow = {
      location: {
        hostname: 'localhost',
      },
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ConfigService,
        { provide: ConnectionService, useValue: connectionServiceSpy },
        { provide: WINDOW, useValue: mockWindow },
      ],
    });

    service = TestBed.inject(ConfigService);

    // Spy on protected helper methods on the service instance to prevent actual Firebase SDK network calls
    spyOn(service as any, 'initializeFirebaseApp').and.returnValue({} as any);
    spyOn(service as any, 'initializeAppCheckInstance').and.returnValue({} as any);
    spyOn(service as any, 'getRemoteConfigInstance').and.returnValue({
      settings: {},
    } as any);
    spyOn(service as any, 'fetchRemoteConfig').and.returnValue(Promise.resolve(true));
  });

  afterEach(() => {
    // Restore original config value to prevent cross-test leakage
    firebaseConfig.appCheckDebugToken = originalAppCheckDebugToken;
    delete (globalThis as any).FIREBASE_APPCHECK_DEBUG_TOKEN;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('App Check Sandbox Mode Verification', () => {
    it('should assign custom App Check debug token in Locked Mode when it is defined', async () => {
      // Arrange
      firebaseConfig.appCheckDebugToken = 'my-custom-persistent-token';
      connectionServiceSpy.getOnlineStatus.and.returnValue(true);

      // Act
      await service.initialize();

      // Assert
      expect((globalThis as any).FIREBASE_APPCHECK_DEBUG_TOKEN).toBe('my-custom-persistent-token');
    });

    it('should fallback to Transient Mode (isDevMode() or isLocalhost) when appCheckDebugToken is empty', async () => {
      // Arrange
      firebaseConfig.appCheckDebugToken = '';
      connectionServiceSpy.getOnlineStatus.and.returnValue(true);
      mockWindow.location.hostname = 'localhost'; // Guarantees isLocalhost is true

      // Act
      await service.initialize();

      // Assert
      // Since isLocalhost is true, FIREBASE_APPCHECK_DEBUG_TOKEN should evaluate to true
      expect((globalThis as any).FIREBASE_APPCHECK_DEBUG_TOKEN).toBe(true);
    });
  });
});
