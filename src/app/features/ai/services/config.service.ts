import { isDevMode, Service } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { fetchAndActivate, getRemoteConfig, RemoteConfig } from 'firebase/remote-config';

import firebaseConfig from '../../../../../firebase/firebase.config.json';
import remoteConfigDefaults from '../../../../../firebase/remote-config-defaults.json';

@Service()
export class ConfigService {
  #app: FirebaseApp | undefined = undefined;
  #remoteConfig: RemoteConfig | undefined = undefined;

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

    if (firebaseConfig.recaptchaEnterpriseKey) {
      if (isDevMode()) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      }
      initializeAppCheck(this.#app, {
        provider: new ReCaptchaEnterpriseProvider(firebaseConfig.recaptchaEnterpriseKey),
        isTokenAutoRefreshEnabled: true,
      });
    }

    this.#remoteConfig = getRemoteConfig(this.#app);
    this.#remoteConfig.defaultConfig = remoteConfigDefaults;
    this.#remoteConfig.settings.minimumFetchIntervalMillis = isDevMode() ? 0 : 3600000;

    try {
      const activated = await fetchAndActivate(this.#remoteConfig);
      console.log('Remote Config initialized. Activated new values:', activated);
    } catch (error) {
      console.error('Failed to fetch and activate remote config:', error);
    }
  }
}
