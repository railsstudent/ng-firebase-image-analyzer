import { ONE_HOUR_MS, WINDOW } from '@/core/constants';
import firebaseConfig from '@/public/firebase.config.json';
import remoteConfigDefaults from '@/public/remote-config-defaults.json';
import { inject, isDevMode, Service } from '@angular/core';
import type { AI, ThinkingLevel } from 'firebase/ai';
import type { FirebaseApp } from 'firebase/app';
import type { AppRemoteConfig } from './app-remote-config.interface';
import { isLocalhost, isOnline } from './host.util';

const DEV_TIMEOUT = 1000;
const PROD_TIMEOUT = 2000;

@Service()
export class ConfigService {
  readonly #win = inject(WINDOW);
  #app: FirebaseApp | undefined = undefined;
  #ai: AI | null = null;
  #appReady: Promise<void> | null = null;
  #appCheck: Promise<void> | null = null;

  #appConfig: AppRemoteConfig = {
    useLimitedUseAppCheckTokens: remoteConfigDefaults.useLimitedUseAppCheckTokens === 'true',
    vertexAILocation: remoteConfigDefaults.vertexAILocation,
    geminiModelName: remoteConfigDefaults.geminiModelName,
    geminiTTSModelName: remoteConfigDefaults.geminiTTSModelName,
    thinkingLevel: remoteConfigDefaults.thinkingLevel as ThinkingLevel,
  };

  get appConfig(): AppRemoteConfig {
    return this.#appConfig;
  }

  private configureAppCheckDebugToken(isLocalhost: boolean): void {
    (globalThis as Record<string, unknown>)['FIREBASE_APPCHECK_DEBUG_TOKEN'] = isLocalhost
      ? firebaseConfig.appCheckDebugToken || true
      : false;
  }

  private loadAppCheck(isLocalhost: boolean, key: string): Promise<void> {
    const appCheck = import('firebase/app-check');
    return appCheck.then(({ initializeAppCheck, ReCaptchaEnterpriseProvider }) => {
      this.configureAppCheckDebugToken(isLocalhost);
      initializeAppCheck(this.#app, {
        provider: new ReCaptchaEnterpriseProvider(key),
        isTokenAutoRefreshEnabled: true,
      });
    });
  }

  private ensureAppCheck(isLocalhost: boolean): Promise<void> {
    if (!this.#appCheck) {
      this.#appCheck = this.loadAppCheck(isLocalhost, firebaseConfig.recaptchaEnterpriseKey);
    }
    return this.#appCheck;
  }

  async getApp(): Promise<FirebaseApp> {
    this.initialize();

    if (this.#appReady) {
      await this.#appReady;
    }

    if (!this.#app) {
      throw new Error('Firebase App initialization failed');
    }
    return this.#app;
  }

  async getAiBackend(): Promise<AI> {
    if (this.#ai) {
      return this.#ai;
    }

    const app = await this.getApp();

    if (isOnline(this.#win) && firebaseConfig.recaptchaEnterpriseKey) {
      await this.ensureAppCheck(isLocalhost(this.#win));
    }

    const { getAI, AgentPlatformBackend } = await import('firebase/ai');
    this.#ai = getAI(app, {
      backend: new AgentPlatformBackend(this.#appConfig.vertexAILocation),
      useLimitedUseAppCheckTokens: this.#appConfig.useLimitedUseAppCheckTokens,
    });

    return this.#ai;
  }

  private loadFirebase(): Promise<void> {
    return Promise.all([import('firebase/app'), import('firebase/remote-config')])
      .then(([{ initializeApp }, remoteConfigSdk]) => {
        this.#app = initializeApp(firebaseConfig.app);
        this.fetchRemoteConfig(remoteConfigSdk);
      })
      .catch((error) => {
        console.warn('Firebase initialization failed:', error);
        this.#appReady = null;
        this.#app = undefined;
        this.#ai = null;
      });
  }

  private fetchRemoteConfig({
    getRemoteConfig,
    fetchAndActivate,
    getValue,
  }: Pick<typeof import('firebase/remote-config'), 'getRemoteConfig' | 'fetchAndActivate' | 'getValue'>): void {
    const rc = getRemoteConfig(this.#app);
    rc.defaultConfig = remoteConfigDefaults;
    const dev = isDevMode();
    rc.settings.minimumFetchIntervalMillis = dev ? 0 : ONE_HOUR_MS;
    rc.settings.fetchTimeoutMillis = dev ? DEV_TIMEOUT : PROD_TIMEOUT;
    if (isOnline(this.#win)) {
      fetchAndActivate(rc)
        .then(() => {
          this.#appConfig = {
            vertexAILocation: getValue(rc, 'vertexAILocation').asString(),
            useLimitedUseAppCheckTokens: getValue(rc, 'useLimitedUseAppCheckTokens').asBoolean(),
            geminiModelName: getValue(rc, 'geminiModelName').asString(),
            thinkingLevel: getValue(rc, 'thinkingLevel').asString() as ThinkingLevel,
            geminiTTSModelName: getValue(rc, 'geminiTTSModelName').asString(),
          };
          this.#ai = null;
        })
        .catch((error) => console.warn('Remote Config fetch timed out or failed. Using defaults:', error));
    }
  }

  initialize(): void {
    if (!this.#appReady) {
      this.#appReady = this.loadFirebase();
    }
  }
}
