import { WINDOW } from '@/core/constants/navigator.const';
import { ConnectionService } from '@/core/services/connection.service';
import firebaseConfig from '@/public/firebase.config.json';
import remoteConfigDefaults from '@/public/remote-config-defaults.json';
import { inject, isDevMode, Service } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
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

  async initialize(): Promise<void> {
    this.#app = initializeApp(firebaseConfig.app);

    const isOnline = this.#connectionService.getOnlineStatus();
    const isLocalhost =
      this.#window &&
      (this.#window.location.hostname === 'localhost' || this.#window.location.hostname === '127.0.0.1');

    if (isOnline && firebaseConfig.recaptchaEnterpriseKey) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).FIREBASE_APPCHECK_DEBUG_TOKEN = isDevMode() || isLocalhost;
      initializeAppCheck(this.#app, {
        provider: new ReCaptchaEnterpriseProvider(firebaseConfig.recaptchaEnterpriseKey),
        isTokenAutoRefreshEnabled: true,
      });
    }

    this.#remoteConfig = getRemoteConfig(this.#app);
    this.#remoteConfig.defaultConfig = remoteConfigDefaults;
    this.#remoteConfig.settings.minimumFetchIntervalMillis = isDevMode() ? 0 : 3600000;

    if (isOnline) {
      try {
        const fetchPromise = fetchAndActivate(this.#remoteConfig);
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
