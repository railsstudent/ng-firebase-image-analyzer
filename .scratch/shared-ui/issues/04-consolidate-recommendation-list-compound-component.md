# Ticket 04: Consolidate Recommendation List Compound Component Package

**What to build:** Consolidate the split `recommendation-item` and `recommendation-list` components into a unified, flat compound component package under `src/app/shared/ui/components/recommendation-list/` per the compound component package standard in `docs/architecture/component-context-pattern.md`. Colocate `RecommendationListComponent` and `RecommendationItemComponent`, expose a unified public barrel (`index.ts`), add unit tests for `RecommendationListComponent`, update consumer call sites, and delete the orphaned directory.

**Blocked by:** None (independent technical debt refactoring)

**Status:** done

## Acceptance Criteria & Checklist

- [x] Consolidate directory structure under `src/app/shared/ui/components/recommendation-list/`:
  - Move `recommendation-item.component.ts`, `recommendation-item.component.html`, `recommendation-item.component.css`, and `recommendation-item.component.spec.ts` into `src/app/shared/ui/components/recommendation-list/`.
  - Maintain a flat file layout without nested subdirectories.
- [x] Create public barrel export `src/app/shared/ui/components/recommendation-list/index.ts`:
  - Export `RecommendationListComponent` and `RecommendationItemComponent`.
- [x] Add unit test suite for `RecommendationListComponent`:
  - Implement `src/app/shared/ui/components/recommendation-list/recommendation-list.component.spec.ts` covering:
    - Component creation.
    - Host element attributes (`role="list"` and class `recommendations-list`).
    - Title rendering behavior when `listTitle` input is provided vs null.
    - Default slot content projection.
- [x] Update consumer call sites (blast radius):
  - In `src/app/features/image-analysis/image-recommendation/image-recommendation.component.ts`: replace separate imports with single barrel import from `@/shared/ui/components/recommendation-list`.
  - In `src/app/shared/ui/components/thought-summary/thought-summary.component.ts`: replace separate imports with single barrel import from `@/shared/ui/components/recommendation-list`.
- [x] Remove legacy orphaned folder:
  - Delete `src/app/shared/ui/components/recommendation-item/` once files are migrated.
- [x] Document in ADR 0010:
  - Append addendum to `docs/adr/0010-recommendation-components.md` documenting the compound package colocation and public barrel.
- [x] Update and verify test suites:
  - Run tests with `angular-cli` MCP `run_target` test on `recommendation-list`, `thought-summary`, and `image-recommendation`.
- [x] Enforce repository invariants:
  - Zero `!` non-null assertions, zero `../` relative traversal, native `#` for private state/deps, and TypeScript `private` for methods.
