# 0030. Culinary Guide 3-Tier Deferral Boundaries and Full-Width Accordion Diagnostics

Date: 2026-10-21
Status: Accepted
Supersedes: [ADR-0028](0028-culinary-guide-two-stage-inference-and-lazy-markdown.md)
Relates to: [ADR-0025](0025-hierarchical-deferral-and-on-demand-tab-hydration.md), [ADR-0029](0029-internal-stream-aggregation-for-structured-generative-output.md)

## Context

In [ADR-0028](0028-culinary-guide-two-stage-inference-and-lazy-markdown.md), the Culinary Guide architecture introduced two-stage hybrid inference, lazy markdown isolation (`snarkdown` + `dompurify`), dynamic destination dataset loading, and two-tier diagnostics presentation (Stage 1 master tab group and Stage 2 per-dish accordion diagnostics).

During implementation and browser verification of the Culinary Guide workspace (`CulinaryGuideComponent` and `CulinaryDishListComponent`), three architectural issues emerged around `@defer` granularity and accordion diagnostics layout:

1. **Over-Deferral Inside Repeated Accordion Items**:
   - Wrapping per-dish `<app-token-analytics>` in a 4th nested `@defer (when recipeDetail?.tokenSummary)` with `<app-list-skeleton />` in `@placeholder` inside `CulinaryDishListComponent`'s `@for` loop proved redundant and costly.
   - `CulinaryDishListComponent` is already deferred at the page level until Stage 1 discovery yields dishes, and in Stage 2 recipe streaming ([ADR-0029](0029-internal-stream-aggregation-for-structured-generative-output.md)), `tokenSummary` arrives in the same final completion emission as `recipeHtml`.
   - Importing `ListSkeletonComponent` into `CulinaryDishListComponent` solely for an unreachable or sub-frame `@placeholder` unnecessarily increased the chunk size.

2. **Cramped Accordion Grid & Trapped Diagnostics**:
   - Placing `<app-token-analytics>` inside the right-hand Recipe Instructions column of a `1fr 2fr` (33.3% / 66.7%) 2-column grid compressed both the Ingredients sidebar (33.3%) and the horizontal stacked token bar inside the right column.

3. **Workspace Vertical Overflow**:
   - Applying `min-h-[calc(100vh-8rem)]` on `.culinary-guide-container` and `flex-1` on `.culinary-dish-section` inside `AppComponent`'s root shell (`.app-container` `min-h-screen` + `.main-content` `flex-grow pt-16` + `<app-footer>` `py-8`) caused the initial `/culinary-guide` route to exceed `100vh` by the footer height (~3rem), creating an unwanted vertical scrollbar and clipping the footer before any dishes were expanded.

## Decision

1. **Retain All Core Two-Stage Inference & Isolation Decisions from [ADR-0028](0028-culinary-guide-two-stage-inference-and-lazy-markdown.md)**:
   - Keep Two-Stage Hybrid Inference (Stage 1 discovery of 6 iconic dishes + 1–2 honorable mentions; Stage 2 on-demand recipe synthesis).
   - Keep dynamic ESM `import()` isolation for `snarkdown`, `dompurify`, and `destinations.json` with zero `@angular/common/http` footprint.
   - Keep session-scoped in-memory recipe caching (`#recipeCache`) and `AiModelCacheService` model reuse.

2. **Enforce a Strict 3-Tier `@defer` Hierarchy in Culinary Guide**:
   - **Level 1 (Middle Dish List)**: In `CulinaryGuideComponent`, wrap `<app-culinary-dish-list>` in `@defer (when dishes().length > 0)` with a glassmorphic empty-state card in `@placeholder`. `CulinaryDishListComponent` also maintains an internal `@if (dishes().length > 0) ... @else` empty-state card to satisfy the Deferred Component Empty State Invariant when reset post-hydration.
   - **Level 2 (Bottom Discovery Panel)**: In `CulinaryGuideComponent`, wrap `<app-culinary-discovery-panel>` in `@defer (when discoveryData())` with a glassmorphic empty-state card in `@placeholder`.
   - **Level 3 (Secondary Discovery Tab)**: Inside `CulinaryDiscoveryPanelComponent`, render Tab 1 (`Thought Summary`) eagerly for zero-latency first paint, and wrap Tab 2 (`Token Usage`) in `@defer (when tokensTab.isActive())` with `<app-token-analytics-skeleton />` in `@placeholder`.

3. **Stage 2 Accordion Diagnostics with `@defer` and Reused `<app-skeleton>`**:
   - Inside `CulinaryDishListComponent`, place `<app-token-analytics>` below `.dish-content-grid` spanning 100% container width.
   - Wrap `<app-token-analytics>` in `@defer (when recipeDetail?.tokenSummary)` with `<app-skeleton variant="line" [lines]="4" class="w-full" />` in `@placeholder` (reusing the already-imported `SkeletonComponent`).
   - Prune `ListSkeletonComponent` from imports to keep chunk size minimal.

4. **Unified Document Scrolling, Natural Workspace Height & Expanded Accordion Trigger Anchoring**:
   - `.culinary-guide-container` in `CulinaryGuideComponent` stacks its three `@defer` sections naturally (`@apply flex flex-col gap-8 max-w-(--spacing-container-max) mx-auto px-4 py-8;`) without `min-h-[calc(100vh-8rem)]` or `.culinary-dish-section { @apply flex-1; }`, delegating full-viewport sticky footer placement to `AppComponent` (`.app-container` `min-h-screen` + `.main-content` `flex-grow`) so `/culinary-guide` renders with zero initial vertical scrollbar and an unclipped footer.
   - `.dish-body` in `CulinaryDishListComponent` flows naturally with the root document scrollport (`@apply flex flex-col gap-6 pt-4;`), avoiding nested `max-h` / `overflow-y-auto overscroll-contain` scroll containers that trap wheel and trackpad gestures when streaming completes or when re-expanding cached recipes.
   - `AccordionItemComponent` applies `scroll-mt-20` (`scroll-margin-top: 5rem`, clearing the fixed `4rem` top navigation bar with `1rem` spacing) to `<button #triggerButton class="accordion-trigger">` and invokes `scrollIntoView({ behavior: 'smooth', block: 'nearest' })` inside `afterRenderEffect` when `isExpanded()` becomes `true`, keeping newly expanded dish headers anchored in the viewport after sibling panels collapse.

## Consequences

- **Positive**:
  - `TokenAnalyticsComponent` remains in a lazy chunk until recipe generation finishes.
  - Zero added bundle overhead by reusing existing `<app-skeleton>`.
  - Zero layout shift during recipe generation due to the line skeleton placeholder.
  - Clear visual hierarchy with full-width token analytics beneath the 40% / 60% ingredients and recipe grid.
  - Smooth, uninterrupted window scrolling across streaming and cached recipes, with automatic viewport anchoring on expanded accordion headers.
- **Negative**:
  - First expansion and completion of a recipe requires hydrating the `TokenAnalyticsComponent` chunk (mitigated by immediate placeholder display).
