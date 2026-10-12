# 03: Create Token Analytics Skeleton Component

**What to build:**
A dedicated placeholder skeleton component (`TokenAnalyticsSkeletonComponent`) located under `src/app/features/image-analysis/` (co-located alongside existing feature skeletons `image-recommendation-skeleton` and `image-improvement-skeleton`). It displays layout-stable animated shimmer bars mirroring the token budget composite progress bar, modality breakdown splits (prompt, candidate, cached), and cached savings card during initial loading or missing data states.

**Blocked by:** 02: Defer Image Analysis Panel with Empty-State Placeholder Card

**Context & Shared Assets:**

- `src/app/shared/ui/styles/skeleton.css` is a pre-existing shared stylesheet defining `@keyframes skeletonPulse` and baseline utility classes (`.skeleton-line`, `.skeleton-circle`, `.skeleton-block`).
- Sibling skeleton components (`image-recommendation-skeleton`, `image-improvement-skeleton`) include this file via `styleUrls: ['../../../shared/ui/styles/skeleton.css', ...]`.

**Status:** done

## Acceptance criteria

- [x] Create `TokenAnalyticsSkeletonComponent` in `src/app/features/image-analysis/token-analytics-skeleton/` referencing `skeleton.css`.
- [x] Template renders shimmer placeholders for the section header, composite token bar, modality breakdown grid, and cached savings card to prevent Cumulative Layout Shift (CLS).
- [x] Update `TokenAnalyticsComponent` to render `<app-token-analytics-skeleton />` via `@if (tokenSummary()) / @else` when token metrics are not available.
- [x] Align skeleton pulse animations and shared classes (`.skeleton-line`, `.skeleton-block`, `.skeleton-circle`, and `skeletonPulse`) with `src/app/shared/ui/styles/skeleton.css` across sibling skeleton components.
- [x] Refactor custom skeleton styles in `token-analytics-skeleton.component.css` to maximize reuse of shared rules from `skeleton.css`.
- [x] Fix cross-browser streaming `usageMetadata` dropping (e.g. Firefox / non-Chrome engines where Firebase AI SDK `aggregateResponses()` omits `usageMetadata` on `result.response`) by capturing streaming chunk metadata in `AiService.generateContentStream`.
- [x] Implement `ZERO_TOKEN_SUMMARY` in `src/app/core/firebase/token-usage.const.ts` and fallback in `ImageAnalysisService` upon final response completion so on-device / zero-metric inference terminates the skeleton shimmer instead of hanging indefinitely.
- [x] Preserve `tokenSummary = undefined` during active stream generation so the skeleton shimmer displays until the final response arrives, avoiding premature `0, 0, 0, 0` displays.
- [x] Unit tests in `token-analytics-skeleton.component.spec.ts` verify skeleton creation and DOM structure.
- [x] Unit tests in `token-analytics.component.spec.ts` verify fallback to skeleton when `tokenSummary` is null/empty.
- [x] Unit tests in `image-recommendation-skeleton.component.spec.ts` verify sibling skeleton creation, DOM structure, and row styling.
- [x] Unit tests in `image-improvement-skeleton.component.spec.ts` verify sibling skeleton creation and layout placeholder elements.
- [x] Passes `npm run lint` and `npm run test:once` with zero regressions.
