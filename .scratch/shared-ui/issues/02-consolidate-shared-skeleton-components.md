# Ticket 02: Consolidate Shared Skeleton Components into Configurable AppSkeleton

**What to build:** Consolidate multiple redundant skeleton components (`token-analytics-skeleton`, `image-recommendation-skeleton`, `image-improvement-skeleton`) into a single, parameterized `<app-skeleton>` component under `src/app/shared/ui/components/skeleton/` to reduce component sprawl and promote uniform loading states.

**Blocked by:** None (can be tackled as a dedicated shared-ui refactoring ticket)

**Status:** ready-for-agent

- [ ] Create `SkeletonComponent` (`<app-skeleton>`) under `src/app/shared/ui/components/skeleton/`:
  - Input: `shape = input<'line' | 'circle' | 'rect' | 'card'>('line')`
  - Input: `lines = input<number>(1)` to render multiple lines with progressive random/varied widths
  - Input: `width = input<string>()` (optional Tailwind width class or style binding)
  - Input: `height = input<string>()` (optional height class or style binding)
  - Leverages `@keyframes skeletonPulse` from `src/app/shared/ui/styles/skeleton.css`
- [ ] Migrate `token-analytics-skeleton` to compose `<app-skeleton>` (or retire in favor of parameterized layouts).
- [ ] Migrate `image-recommendation-skeleton` to compose `<app-skeleton>`.
- [ ] Migrate `image-improvement-skeleton` to compose `<app-skeleton>`.
- [ ] Write unit tests for `SkeletonComponent` asserting rendering across all shapes, line counts, and CSS classes.
- [ ] Verify existing feature test suites pass without regressions after migration.
