# Ticket 03: Consolidate Tab Group Compound Component Package

**What to build:** Consolidate the split `tab` and `tab-group` components into a unified, flat compound component package under `src/app/shared/ui/components/tabs/` (or `tab-group/`) per the compound component package standard in `docs/architecture/component-context-pattern.md`. Colocate `TabGroupComponent`, `TabComponent`, and `TAB_GROUP_CONTEXT`, replace cross-directory alias imports with local sibling imports, expose a unified public barrel (`index.ts`), and update consumer call sites.

**Blocked by:** None (independent technical debt refactoring)

**Status:** ready-for-agent

## Acceptance Criteria & Checklist

- [ ] Consolidate directory structure under `src/app/shared/ui/components/tab-group/` (or `tabs/`):
  - Move `tab.component.ts` and `tab.component.spec.ts` into the consolidated folder alongside `tab-group.component.ts`, `tab-group.component.html`, `tab-group.component.css`, and `tab-group-context.const.ts`.
  - Maintain a flat file layout without nested subdirectories.
- [ ] Eliminate cross-directory context imports:
  - In `tab.component.ts`, update `import { TAB_GROUP_CONTEXT } from '@/shared/ui/components/tab-group/tab-group-context.const';` to relative sibling import `./tab-group-context.const`.
  - In `tab-group.component.ts`, update `import { TabComponent } from '@/shared/ui/components/tab/tab.component';` to relative sibling import `./tab.component`.
- [ ] Create public barrel export `src/app/shared/ui/components/tab-group/index.ts` (or `tabs/index.ts`):
  - Export `TabGroupComponent`, `TabComponent`, and `TAB_GROUP_CONTEXT`.
- [ ] Update consumer call sites (blast radius):
  - In `src/app/features/image-analysis/image-analysis-panel/image-analysis-panel.component.ts`: replace separate imports with single barrel import from `@/shared/ui/components/tab-group` (or `@/shared/ui/components/tabs`).
- [ ] Remove legacy orphaned folder:
  - Delete `src/app/shared/ui/components/tab/` once files are migrated.
- [ ] Update and verify test suites:
  - Update imports in `src/app/shared/ui/components/tab-group/tab.component.spec.ts`.
  - Run tests with `angular-cli` MCP `run_target` test on `tab-group` and `image-analysis-panel`.
- [ ] Enforce repository invariants:
  - Zero `!` non-null assertions, zero `../` relative traversal, native `#` for private state/deps, and TypeScript `private` for methods.
