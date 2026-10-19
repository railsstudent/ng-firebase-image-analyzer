# 20: Consolidate Fade-In Animation, Rename Section Card Styles, and Refactor Image Analysis

**What to build:** Move the fadeIn keyframes to `src/styles.css` with Tailwind v4 `@utility animate-fade-in`, define `.panel-container` and rename `.analysis-section-card` to `.section-card` in `src/app/shared/ui/styles/section-card.css`. Update all consuming templates in `image-analysis` to `.section-card` and `.panel-container`, convert `ImageAnalysisPanelComponent` to inline `:host { display: block; }` styles, delete `image-analysis-panel.component.css`, and update unit test assertions.

**Blocked by:** 19: Refactor ImageAnalysisPanelComponent to Bind Upstream DisplaySource

**Status:** done

- [x] In `src/styles.css`, define `@keyframes fadeIn` and `@utility animate-fade-in`:
  - Entrance animation translating 10px on Y with cubic-bezier(0.16, 1, 0.3, 1) and forwards fill.
- [x] In `src/app/shared/ui/styles/section-card.css`:
  - Rename `.analysis-section-card` to `.section-card`.
  - Add `.panel-container` styling applying `mt-8`, `transition-opacity`, `duration-500`, and `animate-fade-in`.
- [x] In `src/app/features/image-analysis/`:
  - In `image-recommendation/image-recommendation.component.html`, replace `.analysis-section-card` with `.section-card`.
  - In `image-improvement/image-improvement.component.html`, replace `.analysis-section-card` with `.section-card`.
  - In `image-analysis-panel/image-analysis-panel.component.html`, replace `.analysis-panel-container` with `.panel-container` and `.analysis-section-card` with `.section-card`.
  - In `image-analysis-panel/image-analysis-panel.component.ts`, add inline `styles: ':host { display: block; }'` and remove `'./image-analysis-panel.component.css'` from `styleUrls`.
  - Delete `src/app/features/image-analysis/image-analysis-panel/image-analysis-panel.component.css`.
- [x] In `src/app/features/image-analysis/image-analysis-panel/image-analysis-panel.component.spec.ts`:
  - Update DOM query assertions from `.analysis-panel-container` to `.panel-container`.
- [x] Maintain repository standards: zero `!`, zero `../` (except documented styleUrls exception), native `#` for private state/dependencies, and verify all tests pass with `npx ng test --watch=false`.
