# Ticket 14: Build Shared Accessible Accordion Item Component with Integrated Chevron

**What to build:** A domain-agnostic, accessible accordion item component (`<app-accordion-item>`) that injects the group context, renders an accessible `<button>` trigger with an integrated rotating chevron, exposes standard `[accordion-header]` and `[accordion-body]` projection slots (`<div accordion-header>` and `<div accordion-body>`), and adheres to WAI-ARIA disclosure attributes.

**Blocked by:** Ticket 13: Build Shared Accordion Group Component and State Coordinator

**Status:** ready-for-agent

- [ ] Implement `AccordionItemComponent` (`<app-accordion-item>`) in `src/app/shared/ui/components/accordion/accordion-item.component.ts`.
- [ ] Declare inputs: `id = input.required<string>()`, `disabled = input<boolean>(false)`.
- [ ] Inject `ACCORDION_GROUP_CONTEXT` to compute `isExpanded = computed(() => this.#group?.isItemExpanded(this.id()) ?? false)`.
- [ ] Render accessible `<button>` header trigger with `[attr.aria-expanded]="isExpanded()"`, `[attr.aria-controls]="panelId"`, and toggle click handler (no-op when `disabled()` is true).
- [ ] Embed SVG chevron indicator within the header trigger that smoothly rotates 180° when `isExpanded()` is true using Tailwind CSS transition classes (`transition-transform duration-200`).
- [ ] Render collapsible content panel container with `role="region"`, `[attr.aria-labelledby]="headerId"`, and `[hidden]="!isExpanded()"`.
- [ ] Provide semantic projection slots using attribute selectors: `<ng-content select="[accordion-header]" />` and `<ng-content select="[accordion-body]" />` (projected via `<div accordion-header>` and `<div accordion-body>`).
- [ ] Create barrel export file `src/app/shared/ui/components/accordion/index.ts` exporting `AccordionGroupComponent`, `AccordionItemComponent`, and `ACCORDION_GROUP_CONTEXT`.
- [ ] Write unit tests in `accordion-item.component.spec.ts` testing expansion state binding, disabled trigger suppression, toggle interaction, keyboard activation (`Enter` and `Space`), and proper ARIA linkage.
