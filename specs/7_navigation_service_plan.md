# Specification: Centralized Navigation Service (Single Source of Truth Configuration)

This plan outlines the architecture and implementation steps for creating a centralized, type-safe navigation service (`NavService`) and integrating it with dynamic, configuration-driven route definitions inside `src/app/app.routes.ts`.

## 1. Objectives

* Centralize routing definitions and programmatic navigation logic into a unified core layer.
* Eliminate direct `Router` injections and hardcoded string paths in both `Home` and `Header` components.
* Implement a single source of truth for routing where absolute navigation paths are dynamically derived from relative routing configurations via TypeScript template literal types.
* Decouple the `Header` component by converting it into a reusable presenter component utilizing parameterized inputs (`[navLinks]`).
* Standardize on Angular v22 modern `@Service` decorator patterns.

---

## 2. Architecture & Design

### A. Central Route Single Source of Truth (`src/app/core/types/route.types.ts`)

To align route configurations with compile-time checks, we define a read-only constant holding the base paths, and dynamically derive the type-safe absolute `AppRoute` union type:

```typescript
// Base paths used for setting up Angular router definitions (relative paths)
export const ROUTE_PATHS = {
  HOME: 'home',
  IMAGE_ANALYSIS: 'image-analysis',
} as const;

// Automatically derives absolute path union: '/home' | '/image-analysis'
export type AppRoute = `/${typeof ROUTE_PATHS[keyof typeof ROUTE_PATHS]}`;

export interface NavLink {
  label: string;
  path: AppRoute;
}
```

### B. Synchronized Route Registration (`src/app/app.routes.ts`)

Instead of duplicating string paths, the Angular Router setup binds directly to `ROUTE_PATHS`:

```typescript
import { Routes } from '@angular/router';
import { ROUTE_PATHS } from './core/types/route.types';

export const routes: Routes = [
  {
    path: ROUTE_PATHS.HOME,
    loadComponent: () => import('./features/home/home'),
  },
  {
    path: ROUTE_PATHS.IMAGE_ANALYSIS,
    loadComponent: () => import('./features/image-analysis/image-analysis'),
  },
  {
    path: '',
    redirectTo: ROUTE_PATHS.HOME,
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: ROUTE_PATHS.HOME,
  },
];
```

### C. Navigation Service & Config Provider (`src/app/core/services/nav.service.ts`)

The core `NavService` provides helper navigation bindings and hosts the active headers/links configuration:

```typescript
import { inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { AppRoute, NavLink } from '../types/route.types';

@Service()
export class NavService {
  private readonly router = inject(Router);

  // Central config for top-level navigation links
  readonly links: NavLink[] = [
    { label: 'Home', path: '/home' },
    { label: 'Inference', path: '/image-analysis' },
  ];

  /**
   * Type-safe programmatic navigation to any registered AppRoute.
   */
  to(route: AppRoute): Promise<boolean> {
    return this.router.navigate([route]);
  }
}
```

---

## 3. Implementation Steps

### Step 1: Define Navigation Constants and Derived Types

Create the file `src/app/core/types/route.types.ts` holding `ROUTE_PATHS`, `AppRoute`, and `NavLink`.

### Step 2: Synchronize `src/app/app.routes.ts`

Modify the application routes registration to reference `ROUTE_PATHS` instead of static string literals.

### Step 3: Create the Navigation Service

Create `src/app/core/services/nav.service.ts` using `@Service` to export the global links and the typed `to(route)` transition helper.

### Step 4: Refactor the `Header` Layout Component

Modify `src/app/shared/ui/layout/header/header.ts`:

* Declare a signal-based input `navLinks = input<NavLink[]>([]);`.
* Update the template to dynamically render the anchor tags via `@for (link of navLinks(); track link.path)`.
* Replace the raw `Router` injection with `NavService` to handle programmatic redirection cleanly via `nav.to('/image-analysis')`.

### Step 5: Inject the Configuration at Root Layer (`app.ts` & `app.html`)

* Update `src/app/app.ts` to inject `NavService` as a protected property.

* Update `src/app/app.html` to feed the links input:

  ```html
  <app-header 
    title="Firebase AI Logic Hybrid & On-device Inference" 
    [navLinks]="nav.links" 
  />
  ```

### Step 6: Refactor `Home` Component

Modify `src/app/features/home/home.ts` to replace the direct `Router` reference with `NavService` and route programmatically using `nav.to('/image-analysis')`.

### Step 7: Verification

Run a production compilation (`npm run build`) to verify that the derived types and dependency injections compile successfully.
