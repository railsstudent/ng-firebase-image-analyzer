# Architecture Decision Record (ADR)

## Title: Decouple Dependencies and Enable True Offline Operation with Angular PWA & Dynamic On-Device AI

- **Status**: Proposed
- **Date**: 2026-07-19
- **Authors**: Antigravity & Team

---

## Context

The application is built on top of the Firebase AI SDK, which inherently supports local, client-side model execution (Gemini Nano via WebGPU) under its hybrid inference mode. However, if the internet is disconnected, the application is currently completely unusable:

1. **Static Shell Loading:** No service worker or caching layer exists for static assets (HTML, JS, CSS, fonts), causing the browser to fail loading the files and display a standard browser error/blank page.
2. **Network Dependency Coupling:** Firebase App Check and Remote Config initialization make active network requests during startup. If these fail or block, they throw unhandled reference errors or freeze the application rendering loop.
3. **Hybrid AI Network Checks:** When offline, the Firebase AI SDK's default `PREFER_ON_DEVICE` mode attempts to contact backend endpoints before executing, resulting in a network timeout.

---

## Decisions

We will decouple the application from network-only constraints and introduce offline caching for the entire app shell and typography.

### 1. Angular PWA Integration (`@angular/service-worker`)

We will introduce an Angular Service Worker to manage local offline asset caching. The `ngsw-config.json` will be configured to:

- Prefetch and cache all production bundles (`index.html`, JS, CSS, and manifest).
- Prefetch or lazily cache media and external resources, specifically Fontsource stylesheets, Google Fonts, and the Material Symbols icons, ensuring offline visual fidelity.

#### Step-by-Step Instructions for Adding PWA (Step 1)

1. **Install the package:**
   Run the following terminal command to add the service worker package:

   ```bash
   npm install @angular/service-worker@22.0.3 --save
   ```

2. **Create the Service Worker Caching Config (`ngsw-config.json`):**
   Create a new file at the root of your project `ngsw-config.json` with the following content:

   ```json
   {
     "$schema": "./node_modules/@angular/service-worker/config/schema.json",
     "index": "/index.html",
     "assetGroups": [
       {
         "name": "app",
         "installMode": "prefetch",
         "resources": {
           "files": [
             "/favicon.ico",
             "/index.html",
             "/manifest.webmanifest",
             "/*.css",
             "/*.js"
           ]
         }
       },
       {
         "name": "assets",
         "installMode": "lazy",
         "updateMode": "prefetch",
         "resources": {
           "files": [
             "/assets/**",
             "/images/**",
             "/*.(svg|cur|jpg|jpeg|png|apng|webp|avif|gif|otf|ttf|woff|woff2)"
           ],
           "urls": [
             "https://fonts.googleapis.com/**",
             "https://fonts.gstatic.com/**"
           ]
         }
       }
     ]
   }
   ```

3. **Enable Service Worker and Register Manifest in `angular.json`:**
   In your `angular.json` file, find the `"build"` block under `architect` -> `build` -> `options`, and add the `"serviceWorker"` key and add `"src/manifest.webmanifest"` to `"assets"`:

   ```json
   "options": {
     "browser": "src/main.ts",
     "tsConfig": "tsconfig.app.json",
     "serviceWorker": "ngsw-config.json",
     "assets": [
       {
         "glob": "**/*",
         "input": "public"
       },
       "src/manifest.webmanifest"
     ],
     "styles": ["src/styles.css"]
   }
   ```

4. **Create the Web Manifest (`src/manifest.webmanifest`):**
   Create a new file `src/manifest.webmanifest` with the following contents:

   ```json
   {
     "name": "Firebase AI Image Analyzer",
     "short_name": "AI Analyzer",
     "theme_color": "#1976d2",
     "background_color": "#fafafa",
     "display": "standalone",
     "scope": "/",
     "start_url": "/",
     "icons": [
       {
         "src": "assets/icons/icon-72x72.png",
         "sizes": "72x72",
         "type": "image/png",
         "purpose": "any maskable"
       },
       {
         "src": "assets/icons/icon-192x192.png",
         "sizes": "192x192",
         "type": "image/png",
         "purpose": "any maskable"
       },
       {
         "src": "assets/icons/icon-512x512.png",
         "sizes": "512x512",
         "type": "image/png",
         "purpose": "any maskable"
       }
     ]
   }
   ```

5. **Link the Manifest in `src/index.html`:**
   Add the following `<link>` and `<meta>` tags inside the `<head>` of `src/index.html`:

   ```html
   <link rel="manifest" href="manifest.webmanifest">
   <meta name="theme-color" content="#1976d2">
   ```

6. **Register the Service Worker in `src/app/app.config.ts`:**
   Register the service worker provider in the `appConfig` providers array:

   ```typescript
   import { provideServiceWorker } from '@angular/service-worker';
   import { isDevMode } from '@angular/core';

   export const appConfig: ApplicationConfig = {
     providers: [
       // ... existing providers,
       provideServiceWorker('ngsw-worker.js', {
         enabled: !isDevMode(),
         registrationStrategy: 'registerWhenStable:30000'
       })
     ]
   };
   ```

### 2. SSR-Safe Native `NAVIGATOR` Injection Token

To access the browser's connectivity features cleanly and preserve compatibility with Server-Side Rendering (SSR) and testing, we will wrap the native global `window.navigator` inside an Angular `InjectionToken`:

```typescript
import { isPlatformBrowser } from '@angular/common';
import { inject, InjectionToken, PLATFORM_ID } from '@angular/core';

export const NAVIGATOR = new InjectionToken<Navigator | null>('NAVIGATOR', {
  providedIn: 'root',
  factory: () => {
    const platformId = inject(PLATFORM_ID);
    return isPlatformBrowser(platformId) ? window.navigator : null;
  },
});
```

### 3. Streamlined `ConnectionService`

Rather than binding imperative event listeners to the global window, we will create a lightweight `ConnectionService` that consumes the injected `NAVIGATOR` token and exposes a clean `getOnlineStatus()` query method:

```typescript
import { inject, Service } from '@angular/core';
import { NAVIGATOR } from '@/core/tokens/navigator.token';

@Service()
export class ConnectionService {
  #navigator = inject(NAVIGATOR);

  getOnlineStatus(): boolean {
    return this.#navigator?.onLine ?? true;
  }
}
```

### 4. Dynamic Inference Mode Switching

Inside `AiModelCacheService`, we will inject our `ConnectionService` and dynamically alter the `InferenceMode` depending on network status. If offline, we override the mode to `ONLY_ON_DEVICE`. This forces the Firebase AI SDK to skip all cloud validations and run the analysis strictly in-browser:

```typescript
const isOnline = this.#connectionService.getOnlineStatus();
const mode = isOnline ? InferenceMode.PREFER_ON_DEVICE : InferenceMode.ONLY_ON_DEVICE;
```

### 5. Network-Aware `ConfigService` Initialization

We will bypass blocking network calls inside `ConfigService.initialize()` when offline:

- **App Check:** Only initialize if `getOnlineStatus()` returns `true`.
- **Remote Config:** Only trigger `fetchAndActivate` when online. If offline, the config service will gracefully resolve and fall back to local JSON configuration values (`remote-config-defaults.json`).

---

## Consequences

- **True Offline Autonomy:** Users can open, load, navigate, and analyze images with local Gemini Nano completely offline.
- **Improved Performance:** No redundant network requests are attempted when offline, reducing connection timeouts and maximizing battery/performance efficiency.
- **Robust SSR Safety:** The DI-based `NAVIGATOR` token guarantees that no browser globals are referenced on the server, keeping the rendering loop safe.
- **Seamless Developer Experience:** The `NAVIGATOR` token makes offline capabilities simple to test with mocked providers.
