# 04: Defer Inactive Analysis Panel Tabs with On-Demand Hydration

**What to build:**
Nested deferral for the inactive tabs inside `ImageAnalysisPanelComponent`. The initial active tab ("Thought Summary") remains in the panel chunk for zero-latency first paint, while the three secondary tabs ("Recommendations", "Token Usage", and "Image Improvement") are deferred with `@defer (when !tabRef.isInactive())` and hydrate on-demand when clicked.

**Blocked by:** 03: Create Token Analytics Skeleton Component

**Status:** todo

## Acceptance criteria

- [ ] Keep `<app-tab>` elements undeferred to allow `TabGroupComponent` (`contentChildren(TabComponent)`) to discover all 4 tab headers immediately on initial render.
- [ ] Keep `ThoughtSummaryComponent` directly in the panel bundle for instant display of the default active tab.
- [ ] Wrap `<app-image-recommendation>` in `@defer (when !recTab.isInactive())` with `@placeholder { <app-image-recommendation-skeleton /> }`.
- [ ] Wrap `<app-token-analytics>` in `@defer (when !tokensTab.isInactive())` with `@placeholder { <app-token-analytics-skeleton /> }`.
- [ ] Wrap `<app-image-improvement>` in `@defer (when !improveTab.isInactive())` with `@placeholder { <app-image-improvement-skeleton /> }`.
- [ ] Maintain fixed container constraints across all tab placeholders to ensure 0 Cumulative Layout Shift (CLS) during on-demand hydration.
- [ ] Unit tests in `image-analysis-panel.component.spec.ts` verify tab deferral triggers, skeleton placeholder rendering, and tab hydration on activation.
- [ ] Passes `npm run lint`, `npm run test:once`, and production build check with further reduced entry chunk size.
