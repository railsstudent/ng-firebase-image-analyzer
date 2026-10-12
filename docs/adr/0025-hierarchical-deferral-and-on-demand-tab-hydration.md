# 0025. Hierarchical Deferral and On-Demand Tab Hydration

Date: 2026-10-12
Status: Accepted

## Context

1. **Analysis Bundle Size & Unused Payload**:
   - The analysis feature combines multiple specialized widgets: tag list, thought summary, recommendation list, token analytics breakdown, and image improvement comparison.
   - Eagerly importing all sub-components bundled extensive SVG icons, chart utilities, and comparison layouts into the parent analysis view, burdening initial page load even when the user has not yet uploaded or analyzed an image.
2. **Tab Usage Asymmetry & Zero-Latency Expectation**:
   - The default active tab ("Thought Summary") is viewed by 100% of users who run an analysis, whereas secondary tabs ("Recommendations", "Token Usage", "Image Improvement") are inspected on-demand based on specific user interest.
   - Deferring the entire tab panel including the active tab would introduce a noticeable flash/latency before the primary thought summary appears.
3. **Content Projection & Tab Discovery Timing**:
   - `TabGroupComponent` queries child tabs dynamically via `contentChildren(TabComponent)` to construct and render tab navigation buttons.
   - Deferring `<app-tab>` structural host elements would break `contentChildren` discovery, causing missing or popping tab headers until hydration.
4. **Layout Stability & Cumulative Layout Shift (CLS)**:
   - Loading heavyweight components dynamically without structural bounding boxes risks Cumulative Layout Shift (CLS).
   - Inverted boolean naming (`isInactive`) in `TabComponent` made template condition bindings awkward and non-canonical.

## Decision

1. **Multi-Tier Hierarchical `@defer` Architecture**:
   - **Level 1 (Tag List)**: Wrap `TagListComponent` in `@defer (when tags().length > 0)` with a subtitle and empty-state guidance card in `@placeholder`.
   - **Level 2 (Analysis Panel)**: Wrap `ImageAnalysisPanelComponent` in `@defer (when analysisData())` with a structured empty-state prompt in `@placeholder`.
   - **Level 3 (Nested Tabs)**: Wrap secondary tab contents inside `@defer (when tabRef.isActive())` blocks within each tab host.
2. **Zero-Latency Default Active Tab**:
   - Keep `ThoughtSummaryComponent` directly in the `ImageAnalysisPanelComponent` bundle without `@defer` to guarantee zero-latency first paint of analysis results.
3. **Undeferred `<app-tab>` Host Containers**:
   - Keep `<app-tab>` elements undeferred at all times so `TabGroupComponent` discovers all 4 tab headers immediately upon panel mounting.
4. **Canonical `isActive` Signal**:
   - Refactor `TabComponent` to expose `isActive = computed(() => this.id() === this.#tabGroup.activeTabId())` driven by `TAB_GROUP_CONTEXT`, removing `isInactive`.
   - Enable clean template reference variable bindings: `@defer (when recTab.isActive())`.
5. **Fixed Layout Skeletons in `@placeholder`**:
   - Provide dedicated skeleton components (`ImageRecommendationSkeletonComponent`, `TokenAnalyticsSkeletonComponent`, `ImageImprovementSkeletonComponent`) inside `@placeholder` to preserve container geometry and ensure 0 CLS during hydration.

## Consequences

- **Positive**:
  - Secondary tabs are extracted into discrete lazy chunks (`image-improvement-component`, `token-analytics-component`, `image-recommendation-component`, `tag-list-component`), saving ~11.1 kB transferred JS on initial analysis view.
  - Active thought summary renders instantaneously when analysis data arrives without secondary network delay.
  - All tab navigation buttons render immediately without timing issues.
  - Visual stability is preserved with 0 Cumulative Layout Shift (CLS).
  - Component state model is simplified with canonical boolean naming.
- **Negative**:
  - First-time switching to a secondary tab incurs a small network fetch (mitigated by immediate skeleton rendering and browser cache).
