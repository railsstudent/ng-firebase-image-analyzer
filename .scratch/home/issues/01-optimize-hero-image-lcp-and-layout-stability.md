# 01: Optimize hero image LCP and layout stability with WebP and NgOptimizedImage

**What to build:** Deliver optimized above-the-fold hero image loading on the Home view (`/` and `/home`) to minimize Largest Contentful Paint (LCP) and prevent Cumulative Layout Shift (CLS) by converting the hero image to WebP, integrating Angular's `NgOptimizedImage` directive with high-priority preloading and explicit aspect-ratio constraints, and verifying behaviour with zoneless unit tests.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Convert `public/images/home.jpg` to `public/images/home.webp` with high-quality WebP compression while maintaining visual fidelity.
- [x] Import `NgOptimizedImage` in `HomeComponent` and replace standard `<img>` `src` with `ngSrc="images/home.webp"`.
- [x] Set `priority` attribute and explicit intrinsic dimensions (`width="512"`, `height="382"`) on the hero image element in `HomeComponent` template.
- [x] Enforce `aspect-ratio: 512 / 382` on `.hero-image` in `home.component.css` to guarantee zero layout shift during asset streaming.
- [x] Update `home.component.spec.ts` to use `provideZonelessChangeDetection()` and assert `NgOptimizedImage` attribute bindings (`ngSrc`, `width`, `height`, `priority`).
- [x] Run local Lighthouse audit (`npx lighthouse http://localhost:5005 --chrome-flags="--headless" --output=json,html --output-path=.scratch/home/reports/lighthouse`) against the running dev server to verify LCP breakdown, zero CLS, and Core Web Vitals score.
- [x] Verify test suite passes (`npm run test:once`) and linter passes (`npm run lint`) with zero errors.
