# Ticket 15: Build Culinary Dish List Component with Multi-Expansion and Native Badges

**What to build:** A dedicated presentational feature component (`<app-culinary-dish-list>`) under `src/app/features/culinary-guide/culinary-dish-list/` that renders the list of discovered culinary dishes using the shared `<app-accordion-group>` and `<app-accordion-item>` system. Supports configurable single and multi-expansion modes, surfaces native script pill badges in the header, uses clean `@if` control flow for progressive ingredients alongside inline dual-instance `<app-skeleton>` loading placeholders with container geometry lock, and binds sanitized recipe markdown with eagerly imported bottom diagnostics `<app-token-analytics>`.

**Blocked by:** Ticket 14: Build Shared Accessible Accordion Item Component with Integrated Chevron, Ticket 09: Culinary Guide State Service and Verification, and Ticket 02: Consolidate Shared Skeleton Components into Atomic AppSkeleton Primitive

**Status:** ready-for-agent

- [ ] Create `CulinaryDishListComponent` files in `src/app/features/culinary-guide/culinary-dish-list/`:
  - `culinary-dish-list.component.ts`
  - `culinary-dish-list.component.html`
  - `culinary-dish-list.component.css`
  - `culinary-dish-list.component.spec.ts`
- [ ] Define reactive component signals:
  - `dishes = input.required<CulinaryFoodItem[]>()`: array of discovered dishes.
  - `expandedDishNames = model<string[]>([])`: two-way signal tracking currently expanded dish names (bound directly to accordion group).
  - `loadingDishNames = input<string[]>([])`: array of dish names currently undergoing Stage 2 streaming synthesis.
  - `recipes = input<Record<string, CulinaryRecipeDetail>>({})`: dictionary of loaded/cached recipe details keyed by dish name.
  - `isMulti = input(true)`: configurable boolean input toggling multi-expansion mode on the accordion group.
  - `dishSelected = output<CulinaryFoodItem>()`: event emitted when a dish accordion expands, guarded to only emit if `!recipes()[dish.name] && !loadingDishNames().includes(dish.name)`.
- [ ] Wrap dish collection in template with `<app-accordion-group [isMulti]="isMulti()" [(expandedIds)]="expandedDishNames">`.
- [ ] Populate the `[accordion-header]` slot (`<div accordion-header>`) for each dish:
  - English dish name (`text-on-surface font-semibold text-lg`).
  - Native script pill badge when `dish.nativeName?.trim()` is defined, styled with secondary monospace typography (`--font-mono text-xs px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium`).
  - Concise dish description with responsive line clamping (`text-sm text-on-surface-variant line-clamp-2 md:line-clamp-none mt-1`).
- [ ] Populate the `[accordion-body]` slot (`<div accordion-body>`) using `@if` control flow:
  - **Responsive Layout**: Arrange body as single-column on mobile and two-column on desktop (`grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6`) within vertical scroll containment (`max-h-[60vh] md:max-h-[70vh] overflow-y-auto overscroll-contain`).
  - **Ingredients Presentation & Placeholder**: When `recipeDetail?.ingredients?.length`, render real ingredients as a list; when Stage 2 is loading and ingredients have not yet arrived (`!recipeDetail?.ingredients?.length`), render a 2-line placeholder: `<app-skeleton variant="line" [lines]="2" class="w-48" />`.
  - **Recipe Synthesis Skeleton**: In the instructions slot, apply a baseline geometry lock (`min-h-[160px]`). When `loadingDishNames().includes(dish.name) && !recipeDetail?.recipeHtml`, compose `<app-skeleton variant="line" [lines]="4" class="w-full" />` inside a container marked with `aria-busy="true"` and an accessible screen-reader notice (`<span class="sr-only">Generating recipe instructions...</span>`).
  - **Completed Recipe View**: When `recipeDetail?.recipeHtml` is available, render formatted sanitized HTML via `[innerHTML]`.
  - **Diagnostics (<app-token-analytics>)**: Import `TokenAnalyticsComponent` directly in `CulinaryDishListComponent.imports` (no nested `@defer` to avoid double-deferral jaggy loading). Render at the bottom of the recipe body strictly when `recipeDetail?.tokenSummary` is present: `@if (recipeDetail?.tokenSummary; as summary) { <app-token-analytics [tokenSummary]="summary" [tokenModalityBreakdown]="recipeDetail?.tokenModalityBreakdown" /> }`.
- [ ] Create unit tests in `culinary-dish-list.component.spec.ts` asserting:
  - Correct rendering of dishes list, titles, descriptions, and conditional native badges when `dish.nativeName?.trim()` is present.
  - Expanding an un-cached dish emits `dishSelected` with the complete `CulinaryFoodItem` object.
  - Expanding an already-cached dish (`recipes()[dish.name]` present) or currently loading dish does **not** re-emit `dishSelected`.
  - Initial Stage 2 streaming displays the 2-line ingredients skeleton and 4-line instructions skeleton with `aria-busy="true"`.
  - Display of progressive ingredients replaces the ingredients skeleton while keeping the 4-line instructions skeleton during active streaming.
  - Transition from `<app-skeleton>` instructions placeholder to sanitized recipe HTML and `<app-token-analytics>` on stream completion.
  - Toggling `isMulti` controls accordion group expansion behavior.
  - Programmatic collapse of all dish accordions when `expandedDishNames.set([])` is called.
- [ ] Follow repository invariants: zero `!`, zero `../`, native `#` for private state/deps, and TypeScript `private` for methods.
