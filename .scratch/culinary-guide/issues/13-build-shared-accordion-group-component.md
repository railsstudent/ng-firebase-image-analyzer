# Ticket 13: Build Shared Accordion Group Component and State Coordinator

**What to build:** A domain-agnostic, zero-dependency accordion group container component (`<app-accordion-group>`) that coordinates expansion state across child items, supporting both single-expansion mode (default) and multi-expansion mode (`isMulti = true`), with two-way signal synchronization and programmatic reset capabilities.

**Blocked by:** Ticket 12: Define Recipe Accordion Domain and Design Specifications

**Status:** in-progress

- [x] Create `ACCORDION_GROUP_CONTEXT` injection token and interface in `src/app/shared/ui/components/accordion/accordion-context.const.ts`:
  - `isItemExpanded(id: string): boolean`
  - `toggleItem(id: string): void`
  - _Encapsulation design_: Exposes strictly behavioral methods; state signals (`isMulti`, `expandedIds`) remain encapsulated in `AccordionGroupComponent` and are not revealed to child items.
- [x] Implement `AccordionGroupComponent` (`<app-accordion-group>`) satisfying `AccordionGroupContext`:
  - Input: `readonly isMulti = input(false)` to control single vs. multi-expansion mode (defaulting to single-expansion `false`).
  - Two-way state model: `readonly expandedIds = model<string[]>([])` tracking all currently expanded item IDs in natural interaction order.
  - Method: `isItemExpanded(id: string): boolean` returning `this.expandedIds().includes(id)`.
  - Method: `toggleItem(id: string): void` updating `expandedIds` using mode-specific signal methods:
    - Multi mode (`isMulti()`): uses `this.expandedIds.update(...)` to filter out or append item ID.
    - Single mode: uses `this.expandedIds.set(...)` directly setting `[]` (if already expanded) or `[id]` (if not).
  - Method: `collapseAll(): void` setting `this.expandedIds.set([])`.
- [x] Provide `ACCORDION_GROUP_CONTEXT` from `AccordionGroupComponent` using `useExisting: AccordionGroupComponent`.
- [ ] Render container template with un-slotted `<ng-content />`.
- [ ] Create comprehensive unit tests in `accordion-group.component.spec.ts` testing:
  - Initial collapsed state (`expandedIds` is empty).
  - Single-expansion mode (`isMulti = false`): expanding one item closes any previously open item.
  - Toggling an open item collapses it in single mode.
  - Multi-expansion mode (`isMulti = true`): multiple items can be expanded simultaneously.
  - Programmatic resets via `expandedIds.set([])` and `collapseAll()` reactively collapsing all items.
- [x] Follow repository invariants: zero `!`, zero `../`, native `#` for private state/deps, and TypeScript `private` for methods.
