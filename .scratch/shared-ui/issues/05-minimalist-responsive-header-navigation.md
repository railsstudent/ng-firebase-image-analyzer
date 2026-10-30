# 05: Minimalist Responsive Header Navigation

**What to build:** Refactor `HeaderComponent`, `src/layout.css`, and `src/app/core/routing/nav-links.const.ts` to provide a minimalist, mobile-accessible navigation bar without extra JavaScript overhead. Export `HOME_NAV_LINK` alongside `APP_NAV_LINKS` (retaining only `'Analysis'` and `'Culinary Guide'` in `APP_NAV_LINKS`) backed by `ROUTE_PATHS`. Convert `.nav-brand-title` in `HeaderComponent` into an accessible home anchor (`[routerLink]="homeLink().path"` and `[attr.aria-label]="homeLink().label"`) wrapping `<app-terminal-icon />` and `<span class="hidden sm:inline">{{ title() }}</span>`, make `.nav-links` visible across all viewports (`flex` instead of `hidden md:flex`), remove the redundant `"Get Started"` CTA button and `.nav-cta-btn` CSS class, and add a dedicated unit test suite (`header.component.spec.ts`).

**Blocked by:** None (can start immediately)

**Status:** done

## Acceptance Criteria & Implementation Checklist

### 1. Define `HOME_NAV_LINK` and Trim `APP_NAV_LINKS` (`src/app/core/routing/nav-links.const.ts`)

- [x] Export `HOME_NAV_LINK` and update `APP_NAV_LINKS` in `src/app/core/routing/nav-links.const.ts` to derive paths from `ROUTE_PATHS` and include only feature routes (`Analysis` and `Culinary Guide`):

  ```ts
  import type { AppLink } from './app-link.interface';
  import { ROUTE_PATHS } from './route.const';

  export const HOME_NAV_LINK: AppLink = {
    label: 'Home',
    path: `/${ROUTE_PATHS.HOME}`,
  };

  export const APP_NAV_LINKS: AppLink[] = [
    { label: 'Analysis', path: `/${ROUTE_PATHS.IMAGE_ANALYSIS}` },
    { label: 'Culinary Guide', path: `/${ROUTE_PATHS.CULINARY_GUIDE}` },
  ];
  ```

### 2. Bind `homeLink` Input in `HeaderComponent` (`src/app/shared/ui/layout/header/header.component.ts`)

- [x] Import `HOME_NAV_LINK` from `@/core/routing` and add `homeLink = input<AppLink>(HOME_NAV_LINK)` to `HeaderComponent`:

  ```ts
  import type { AppLink } from '@/core/routing';
  import { APP_NAV_LINKS, HOME_NAV_LINK } from '@/core/routing';
  import { TerminalIconComponent } from '@/shared/ui/icons/terminal-icon/terminal-icon.component';
  import { Component, input } from '@angular/core';
  import { RouterLink, RouterLinkActive } from '@angular/router';

  @Component({
    selector: 'app-header',
    host: {
      class: 'block sticky top-0 z-50',
    },
    imports: [RouterLink, RouterLinkActive, TerminalIconComponent],
    templateUrl: './header.component.html',
  })
  export class HeaderComponent {
    title = input('HomeComponent');
    homeLink = input<AppLink>(HOME_NAV_LINK);
    navLinks = input<AppLink[]>(APP_NAV_LINKS);
  }
  ```

### 3. Update Header Template for Minimalist Responsive Navigation (`src/app/shared/ui/layout/header/header.component.html`)

- [x] Replace the outer brand `<div>` and `<span>` with `<a class="nav-brand-title font-bold gap-2" [routerLink]="homeLink().path" [attr.aria-label]="homeLink().label">`, wrap `{{ title() }}` in `<span class="hidden sm:inline">`, and remove the right-hand `"Get Started"` CTA wrapper (keeping at most 3 classes per element):

  ```html
  <nav class="nav-bar backdrop-blur-md w-full">
    <div class="nav-container px-6 mx-auto">
      <a class="nav-brand-title font-bold gap-2" [routerLink]="homeLink().path" [attr.aria-label]="homeLink().label">
        <app-terminal-icon />
        <span class="hidden sm:inline">{{ title() }}</span>
      </a>
      <div class="nav-links font-medium items-center">
        @for (link of navLinks(); track link.path) {
        <a class="nav-link transition-colors py-1" routerLinkActive="nav-link-active" [routerLink]="link.path">
          {{ link.label }}
        </a>
        }
      </div>
    </div>
  </nav>
  ```

### 4. Make `.nav-links` Visible on Mobile & Remove `.nav-cta-btn` (`src/layout.css`)

- [x] Update `.nav-links` in `src/layout.css` to replace `hidden md:flex` with `flex` (`@apply flex gap-6 lg:gap-8 text-sm md:text-base lg:text-lg;`) and delete the unused `.nav-cta-btn` rule:

  ```css
  /* header styles */
  .nav-bar {
    @apply border-b border-outline-variant/30 bg-primary text-white;
  }

  .nav-container {
    @apply flex justify-between items-center h-16 max-w-container-max;
  }

  .nav-brand-title {
    @apply flex items-center md:text-xl;
  }

  .nav-links {
    @apply flex gap-6 lg:gap-8 text-sm md:text-base lg:text-lg;
  }

  .nav-link {
    @apply text-white/80 hover:text-white;
  }

  .nav-link-active {
    @apply text-white font-bold border-b-2 border-white;
  }
  ```

### 5. Add Unit Test Suite for `HeaderComponent` (`src/app/shared/ui/layout/header/header.component.spec.ts`)

- [x] Create `src/app/shared/ui/layout/header/header.component.spec.ts` to verify brand home link routing, `aria-label` accessibility, responsive title rendering, and feature navigation links without `.nav-cta-btn`:

  ```ts
  import { APP_NAV_LINKS, HOME_NAV_LINK } from '@/core/routing';
  import { TerminalIconComponent } from '@/shared/ui/icons/terminal-icon/terminal-icon.component';
  import { provideZonelessChangeDetection } from '@angular/core';
  import type { ComponentFixture } from '@angular/core/testing';
  import { TestBed } from '@angular/core/testing';
  import { By } from '@angular/platform-browser';
  import { provideRouter } from '@angular/router';
  import { HeaderComponent } from './header.component';

  describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HeaderComponent],
        providers: [provideZonelessChangeDetection(), provideRouter([])],
      }).compileComponents();

      fixture = TestBed.createComponent(HeaderComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should create the component with default inputs', () => {
      expect(component).toBeTruthy();
      expect(component.title()).toBe('HomeComponent');
      expect(component.homeLink()).toEqual(HOME_NAV_LINK);
      expect(component.navLinks()).toEqual(APP_NAV_LINKS);
    });

    it('renders the brand anchor linking to homeLink with aria-label and terminal icon', () => {
      const brandLink: HTMLAnchorElement | null = fixture.nativeElement.querySelector('a.nav-brand-title');
      expect(brandLink).toBeTruthy();
      expect(brandLink?.getAttribute('href')).toBe(HOME_NAV_LINK.path);
      expect(brandLink?.getAttribute('aria-label')).toBe(HOME_NAV_LINK.label);

      const terminalIcon = fixture.debugElement.query(By.directive(TerminalIconComponent));
      expect(terminalIcon).toBeTruthy();

      const titleSpan = brandLink?.querySelector('span.hidden.sm\\:inline');
      expect(titleSpan?.textContent?.trim()).toBe('HomeComponent');
    });

    it('renders feature navigation links for Analysis and Culinary Guide without a Get Started CTA button', () => {
      const navLinkEls: NodeListOf<HTMLAnchorElement> = fixture.nativeElement.querySelectorAll('.nav-links a.nav-link');
      expect(navLinkEls.length).toBe(2);
      expect(navLinkEls[0]?.textContent?.trim()).toBe('Analysis');
      expect(navLinkEls[0]?.getAttribute('href')).toBe('/image-analysis');
      expect(navLinkEls[1]?.textContent?.trim()).toBe('Culinary Guide');
      expect(navLinkEls[1]?.getAttribute('href')).toBe('/culinary-guide');

      const ctaBtn = fixture.nativeElement.querySelector('.nav-cta-btn');
      expect(ctaBtn).toBeNull();
    });
  });
  ```

### 6. Reconcile Design System & Architecture Documentation (`DESIGN.md` & `docs/adr/0001-core-bootstrap-and-firebase-infrastructure.md`)

- [x] Update `DESIGN.md` (§ 4 Main Page Sections — 1. Top Navigation Bar) to document `a.nav-brand-title` (`HOME_NAV_LINK` + `aria-label`) and always-visible `.nav-links`.
- [x] Update `docs/adr/0001-core-bootstrap-and-firebase-infrastructure.md` (§ 2.E Centralized SSR-Safe Navigation) to reflect `HOME_NAV_LINK` and `APP_NAV_LINKS` backed by `ROUTE_PATHS`.
- [x] Run targeted unit tests (`header.component.spec.ts` and `app.component.spec.ts`) and verify all tests pass with zero errors.
