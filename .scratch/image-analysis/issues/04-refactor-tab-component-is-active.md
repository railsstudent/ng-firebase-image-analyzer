# 04: Refactor TabComponent with Canonical isActive Signal

**What to build:**
Refactor `TabComponent` using Test-Driven Development (TDD) to expose a canonical `isActive = computed(...)` signal as the single source of truth for active tab state, eliminating the negative API surface and inverted boolean logic of `isInactive()`. Update `TabComponent`'s internal template to bind with `[class.hidden]="!isActive()"`.

**Blocked by:** None

**Status:** done

## Agreed Seams

- **Public Interface Seam:** `TabComponent` public inputs (`id`, `label`), computed signal (`isActive()`), content projection (`<ng-content>`), and DOM container class (`.hidden`).
- **DI Boundary Seam:** `TAB_GROUP_CONTEXT` injection token providing `{ activeTabId: Signal<string | null> }`.

## TDD Vertical Slices (Red → Green)

1. **Slice 1: Active State Calculation (Test First)**
   - _Red_: Write spec in `tab.component.spec.ts` asserting `isActive()` returns `true` when `TAB_GROUP_CONTEXT.activeTabId()` equals `id()`, and `false` when it differs or is `null`.
   - _Green_: Implement `isActive = computed(() => this.id() === this.#tabGroup.activeTabId())` on `TabComponent`.

2. **Slice 2: DOM Visibility Class Binding (Test First)**
   - _Red_: Write spec asserting the inner wrapper `<div>` does NOT have `.hidden` when `isActive()` is `true`, and HAS `.hidden` when `isActive()` is `false`.
   - _Green_: Update template to `<div [class.hidden]="!isActive()"><ng-content>No content at the moment</ng-content></div>`.

3. **Slice 3: Content Projection & Fallback (Test First)**
   - _Red_: Write spec verifying projected DOM nodes render inside the active tab, and default fallback text `"No content at the moment"` renders when no content is projected.
   - _Green_: Confirm ng-content projection behavior passes.

## Acceptance Criteria

- [x] Create `src/app/shared/ui/components/tab/tab.component.spec.ts` with comprehensive unit tests for all agreed seams.
- [x] Refactor `TabComponent` in `src/app/shared/ui/components/tab/tab.component.ts` to expose `isActive = computed(() => this.id() === this.#tabGroup.activeTabId())`.
- [x] Remove `isInactive` from `TabComponent` and update the inline template binding to `<div [class.hidden]="!isActive()">`.
- [x] Verify test suite passes with `100%` branch coverage for `TabComponent`.
- [x] Passes `npm run lint` and `npm run test:once` with zero regressions.
