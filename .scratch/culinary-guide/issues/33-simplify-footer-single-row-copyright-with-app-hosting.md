# 33: Simplify Footer Component to Single-Row Copyright with Terminal Icon and Firebase App Hosting

**What to build:** Remove the redundant `"Firebase AI Logic"` text span (`.footer-brand-title`) from `FooterComponent` while keeping `<app-terminal-icon class="text-white" />`, add `"Firebase App Hosting"` to the copyright technology stack line, update `.footer-container` so the terminal icon and copyright render cleanly on a single row, and add unit test coverage in `footer.component.spec.ts`.

**Blocked by:** None (can start immediately)

**Status:** done

## Acceptance Criteria & Implementation Checklist

### 1. Update Footer Template (`src/app/shared/ui/layout/footer/footer.component.html`)

- [x] Keep `<app-terminal-icon class="text-white" />`, remove `<span class="footer-brand-title">Firebase AI Logic</span>`, and update the copyright string to include `Firebase App Hosting`:

```html
<footer class="footer-bar">
  <div class="footer-container">
    <div class="footer-brand">
      <app-terminal-icon class="text-white" />
    </div>
    <span class="footer-copyright">
      &copy; {{ copyrightYear }} Hybrid & On-device Image Analyzer. Built with Angular, Gemini, Firebase AI Logic,
      Firebase App Hosting & Tailwind.
    </span>
  </div>
</footer>
```

### 2. Simplify Footer Styles (`src/app/shared/ui/layout/footer/footer.component.css`)

- [x] Remove unused `.footer-brand-title` from `src/app/shared/ui/layout/footer/footer.component.css` and keep `.footer-brand` (`@apply flex items-center shrink-0;`):

  ```css
  @reference "../../../../../styles.css";

  .footer-bar {
    @apply bg-primary text-white w-full py-8 mt-auto;
  }

  .footer-container {
    @apply max-w-container-max mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4;
  }

  .footer-brand {
    @apply flex items-center shrink-0;
  }

  .footer-copyright {
    @apply text-lg text-white/80 text-center md:text-left;
  }
  ```

### 3. Unit Tests (`src/app/shared/ui/layout/footer/footer.component.spec.ts`)

- [x] Create `src/app/shared/ui/layout/footer/footer.component.spec.ts` verifying:
  - `FooterComponent` initializes `copyrightYear` from the current year.
  - Renders `<app-terminal-icon>` inside `.footer-brand` without `.footer-brand-title`.
  - `.footer-copyright` renders the current year and `"Hybrid & On-device Image Analyzer. Built with Angular, Gemini, Firebase AI Logic, Firebase App Hosting & Tailwind."`.
- [x] Run targeted unit tests for `footer.component.spec.ts` and verify all test cases pass with zero errors.
