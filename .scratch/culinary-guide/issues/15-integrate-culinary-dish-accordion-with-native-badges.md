# Ticket 15: Build Culinary Dish List Component with Multi-Expansion and Native Badges

**What to build:** A dedicated presentational feature component (`<app-culinary-dish-list>`) under `src/app/features/culinary-guide/culinary-dish-list/` that renders the list of discovered culinary dishes using the shared `<app-accordion-group>` and `<app-accordion-item>` system. Supports single and multi-expansion modes, surfaces native script pill badges in the header, uses clean `@if` control flow for progressive ingredients and inline instructions loading skeletons, and binds sanitized recipe markdown with token analytics in the body.

**Blocked by:** Ticket 14: Build Shared Accessible Accordion Item Component with Integrated Chevron, and Ticket 09: Culinary Guide State Service and Verification

**Status:** ready-for-agent

- [ ] Create `CulinaryDishListComponent` files in `src/app/features/culinary-guide/culinary-dish-list/`:
  - `culinary-dish-list.component.ts`
  - `culinary-dish-list.component.html`
  - `culinary-dish-list.component.css`
  - `culinary-dish-list.component.spec.ts`
- [ ] Define reactive component signals:
  - `dishes = input.required<readonly CulinaryFoodItem[]>()`: array of discovered dishes.
  - `expandedDishNames = model<string[]>([])`: two-way signal tracking currently expanded dish names (bound directly to accordion group).
  - `loadingDishNames = input<readonly string[]>([])`: array of dish names currently undergoing Stage 2 streaming synthesis.
  - `recipes = input<Record<string, CulinaryRecipeDetail>>({})`: dictionary of loaded/cached recipe details keyed by dish name.
  - `dishSelected = output<CulinaryFoodItem>()`: event emitted when a dish accordion expands to trigger recipe streaming.
- [ ] Wrap dish collection in template with `<app-accordion-group [isMulti]="true" [(expandedIds)]="expandedDishNames">` (or configurable single/multi mode).
- [ ] Populate the `[accordion-header]` slot (`<div accordion-header>`) for each dish:
  - English dish name (`text-on-surface font-semibold text-lg`).
  - Native script pill badge when `dish.nativeName` is defined, styled with secondary monospace typography (`--font-mono text-xs px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium`).
  - Concise dish description with responsive line clamping (`text-sm text-on-surface-variant line-clamp-2 md:line-clamp-none mt-1`).
- [ ] Populate the `[accordion-body]` slot (`<div accordion-body>`) using `@if` control flow:
  - **Ingredients Presentation**: Render streaming/cached ingredients as soon as available in `recipeDetail.ingredients`.
  - **Inline Recipe Skeleton (No extra component)**: When `loadingDishNames().includes(dish.name) && !recipeDetail?.recipeHtml`, render inline `.skeleton-line` pulses from `skeleton.css` representing instructions loading.
  - **Completed Recipe View**: When `recipeDetail?.recipeHtml` is available, render formatted sanitized HTML via `[innerHTML]` and pinned bottom diagnostics `<app-token-analytics>`.
  - Apply responsive styling and scroll boundaries: single-column on mobile, two-column on desktop, and vertical scroll containment (`max-h-[60vh] md:max-h-[70vh] overflow-y-auto overscroll-contain`).
- [ ] Create unit tests in `culinary-dish-list.component.spec.ts` asserting:
  - Correct rendering of dishes list, titles, descriptions, and conditional native badges.
  - Expanding an item emits `dishSelected` with the complete `CulinaryFoodItem` object.
  - Display of progressive ingredients alongside the instructions skeleton while streaming.
  - Transition from instructions skeleton to sanitized recipe HTML and `<app-token-analytics>` on stream completion.
  - Programmatic collapse of all dish accordions when `expandedDishNames.set([])` is called.
- [ ] Follow repository invariants: zero `!`, zero `../`, native `#` for private state/deps, and TypeScript `private` for methods.
