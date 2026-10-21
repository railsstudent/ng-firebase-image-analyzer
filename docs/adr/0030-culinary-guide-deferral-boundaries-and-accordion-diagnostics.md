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

3. **Workspace Vertical Distribution**:
   - Using a static `space-y-8` container on `CulinaryGuideComponent` allowed the bottom discovery panel (`CulinaryDiscoveryPanelComponent`) to float directly beneath the search bar before dishes were expanded, rather than anchoring toward the bottom of the viewport.

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

## Consequences

- **Positive**:
  - `TokenAnalyticsComponent` remains in a lazy chunk until recipe generation finishes.
  - Zero added bundle overhead by reusing existing `<app-skeleton>`.
  - Zero layout shift during recipe generation due to the line skeleton placeholder.
  - Clear visual hierarchy with full-width token analytics beneath the 40% / 60% ingredients and recipe grid.
- **Negative**:
  - First expansion and completion of a recipe requires hydrating the `TokenAnalyticsComponent` chunk (mitigated by immediate placeholder display).
