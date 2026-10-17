# Architectural Pattern: Parent-Child Component Context

## 1. Intent & Problem Statement

When designing compound components (such as `TabGroup` / `Tab`, or `AccordionGroup` / `AccordionItem`), child components need reactive coordination from their parent container.

Directly importing the parent class into child items introduces two critical anti-patterns:

1. **Circular ES Module Imports**: Parent imports children (via `contentChildren`), and children import the parent class (via `inject(ParentComponent)`), triggering bundler initialization errors (`Cannot access before initialization`).
2. **Encapsulation Leaks**: Children gain access to parent internal state (such as arrays, multi-mode flags, or collection setters) that they should not manipulate directly.

---

## 2. The Context Injection Pattern

The architecture separates responsibilities into three distinct layers:

```text
┌────────────────────────────────────────────────────────┐
│               AccordionGroupComponent                  │
│  - Owns internal state: expandedIds (model), isMulti   │
│  - Provides ACCORDION_GROUP_CONTEXT via useExisting    │
└─────────────────────────┬──────────────────────────────┘
                          │ (InjectionToken contract)
                          ▼
┌────────────────────────────────────────────────────────┐
│             AccordionGroupContext Contract             │
│  - isItemExpanded(id: string): boolean                 │
│  - toggleItem(id: string): void                        │
└─────────────────────────┬──────────────────────────────┘
                          │ (Injected via token)
                          ▼
┌────────────────────────────────────────────────────────┐
│               AccordionItemComponent                   │
│  - Owns local presentation, chevron, and item identity │
│  - Derives: isExpanded = computed(() => ...)           │
│  - Dispatches: context.toggleItem(this.id())           │
│  - Exposes projection slots: <accordion-header/body>   │
└────────────────────────────────────────────────────────┘
```

Downstream feature components (such as `CulinaryDishListComponent`) compose `<app-accordion-group>` and `<app-accordion-item>` together, projecting domain content (titles, badges, recipes) into the item slots.

---

## 3. Layer Responsibilities

### Tier 1: The Injection Token (`*-context.const.ts`)

- Standalone file with zero component imports.
- Defines a strictly behavioral interface (methods/signals required by children).
- Hides container collection data structures, arrays, and configuration flags.

### Tier 2: The Parent Coordinator (`*-group.component.ts`)

- Implements the context interface.
- Owns state signals (`model`, `signal`, `input`).
- Exposes `providers: [{ provide: CONTEXT_TOKEN, useExisting: GroupComponent }]`.
- Executes state transitions inside its methods (`toggleItem`, `isItemExpanded`).

### Tier 3: The Child Item (`*-item.component.ts`)

- Injects `CONTEXT_TOKEN` (optionally, allowing standalone usage if applicable).
- Evaluates expansion inside a `computed` property:
  `readonly isExpanded = computed(() => this.#context?.isItemExpanded(this.id()) ?? false);`
- Delegates user click interactions to `this.#context?.toggleItem(this.id())`.
- Exposes content projection slots for consumer templates.

---

## 4. Key Invariants

1. **Behavior Over State in Contexts**: Expose evaluation and mutation methods (`isItemExpanded`, `toggleItem`) rather than raw internal arrays (`expandedIds`) on the context token.
2. **Reactivity Preservation**: Methods evaluated inside a child's `computed()` must read the parent's underlying signal so Angular tracks dependencies automatically.
3. **No Direct Parent Imports in Children**: Child components must never import the parent component class.

---

## 5. Compound Component Package Topology

Compound components (e.g., `AccordionGroup` / `AccordionItem`, `TabGroup` / `Tab`) are tightly coupled primitives designed to be consumed together as a coordinated unit.

### Architectural Rules

1. **Single Package Colocation**: Colocate parent coordinator, child item(s), context contracts, and unit tests in a single component folder under `src/app/shared/ui/components/<compound-name>/` (e.g. `src/app/shared/ui/components/accordion/`).
2. **Flat File Layout**: Maintain a flat file structure at the package root without nested subdirectories.
3. **Zero Cross-Directory Context Imports**: Child components reference the context token as a sibling file (`./*-context.const`), avoiding cross-component path aliases and prohibited `../` traversal.
4. **Unified Barrel Export (`index.ts`)**: Expose the parent component, child item(s), and context token through a public `index.ts` so consumers import the entire compound suite from a single entry point (e.g., `@/shared/ui/components/accordion`).
