import { WINDOW } from '@/core/constants/navigator.const';
import { ConnectionService } from '@/core/services/connection.service';
import firebaseConfig from '@/public/firebase.config.json';
import remoteConfigDefaults from '@/public/remote-config-defaults.json';
import { inject, isDevMode, Service } from '@angular/core';
import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app';
import { AppCheck, initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { fetchAndActivate, getRemoteConfig, RemoteConfig } from 'firebase/remote-config';

@Service()
export class ConfigService {
  #app: FirebaseApp | undefined = undefined;
  #remoteConfig: RemoteConfig | undefined = undefined;
  #connectionService = inject(ConnectionService);
  #window = inject(WINDOW);

  get firebaseApp(): FirebaseApp {
    if (!this.#app) {
      throw new Error('Firebase app has not been initialized yet.');
    }
    return this.#app;
  }

  get RemoteConfig() {
    if (!this.#remoteConfig) {
      throw new Error('Firebase remote config has not been initialized yet.');
    }
    return this.#remoteConfig;
  }

  // Testable helper methods to allow mocking of read-only ESM imports
  protected initializeFirebaseApp(config: FirebaseOptions): FirebaseApp {
    return initializeApp(config);
  }

  protected initializeAppCheckInstance(app: FirebaseApp, key: string): AppCheck {
    return initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(key),
      isTokenAutoRefreshEnabled: true,
    });
  }

  protected getRemoteConfigInstance(app: FirebaseApp): RemoteConfig {
    return getRemoteConfig(app);
  }

  protected fetchRemoteConfig(rc: RemoteConfig): Promise<boolean> {
    return fetchAndActivate(rc);
  }

  async initialize(): Promise<void> {
    this.#app = this.initializeFirebaseApp(firebaseConfig.app);

    const isOnline = this.#connectionService.getOnlineStatus();
    const isLocalhost =
      this.#window &&
      (this.#window.location.hostname === 'localhost' || this.#window.location.hostname === '127.0.0.1');

    if (isOnline && firebaseConfig.recaptchaEnterpriseKey) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).FIREBASE_APPCHECK_DEBUG_TOKEN =
        firebaseConfig.appCheckDebugToken || isDevMode() || isLocalhost;
      this.initializeAppCheckInstance(this.#app, firebaseConfig.recaptchaEnterpriseKey);
    }

    this.#remoteConfig = this.getRemoteConfigInstance(this.#app);
    this.#remoteConfig.defaultConfig = remoteConfigDefaults;
    this.#remoteConfig.settings.minimumFetchIntervalMillis = isDevMode() ? 0 : 3600000;

    if (isOnline) {
      try {
        const fetchPromise = this.fetchRemoteConfig(this.#remoteConfig);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Fetch timeout')), 1500),
        );
        const activated = await Promise.race([fetchPromise, timeoutPromise]);
        console.log('Remote Config initialized. Activated new values:', activated);
      } catch (error) {
        console.warn('Remote Config fetch timed out or failed. Using defaults:', error);
      }
    }
  }
}
