# Ticket 13: Build Shared Accordion Group Component and State Coordinator

**What to build:** A domain-agnostic, zero-dependency accordion group container component (`<app-accordion-group>`) that coordinates expansion state across child items, supporting both single-expansion mode (default) and multi-expansion mode (`isMulti = true`), with two-way signal synchronization and programmatic reset capabilities.

**Blocked by:** Ticket 12: Define Recipe Accordion Domain and Design Specifications

**Status:** ready-for-agent

- [ ] Create `ACCORDION_GROUP_CONTEXT` injection token and interface in `src/app/shared/ui/components/accordion/accordion-context.const.ts`:
  - `isItemExpanded(id: string): boolean`
  - `toggleItem(id: string): void`
  - _Encapsulation design_: Exposes strictly behavioral methods; state signals (`isMulti`, `expandedIds`) remain encapsulated in `AccordionGroupComponent` and are not revealed to child items.
- [ ] Implement `AccordionGroupComponent` (`<app-accordion-group>`) satisfying `AccordionGroupContext`:
  - Input: `readonly isMulti = input<boolean>(false)` to control single vs. multi-expansion mode (defaulting to single-expansion `false`).
  - Two-way state model: `readonly expandedIds = model<readonly string[]>([])` tracking all currently expanded item IDs.
  - Computed convenience: `readonly activeId = computed(() => this.expandedIds()[0] ?? null)` for single-mode callers.
  - Method: `isItemExpanded(id: string): boolean` returning `this.expandedIds().includes(id)`.
  - Method: `toggleItem(id: string): void` updating `expandedIds`:
    - If already expanded (`includes(id)`): `ids.filter(item => item !== id)` (closes item in both single and multi mode).
    - If not expanded: `this.isMulti() ? [...ids, id] : [id]`.
  - Method: `collapseAll(): void` setting `this.expandedIds.set([])`.
- [ ] Provide `ACCORDION_GROUP_CONTEXT` from `AccordionGroupComponent` using `useExisting: AccordionGroupComponent`.
- [ ] Render container template with un-slotted `<ng-content />`.
- [ ] Create comprehensive unit tests in `accordion-group.component.spec.ts` testing:
  - Initial collapsed state (`expandedIds` is empty).
  - Single-expansion mode (`isMulti = false`): expanding one item closes any previously open item.
  - Toggling an open item collapses it in single mode.
  - Multi-expansion mode (`isMulti = true`): multiple items can be expanded simultaneously.
  - Programmatic resets via `expandedIds.set([])` and `collapseAll()` reactively collapsing all items.
- [ ] Follow repository invariants: zero `!`, zero `../`, native `#` for private state/deps, and TypeScript `private` for methods.
