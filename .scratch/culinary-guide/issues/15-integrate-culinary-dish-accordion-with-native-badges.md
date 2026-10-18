# Ticket 15: Build Culinary Dish List Component with Multi-Expansion and Native Badges

**What to build:** A dedicated presentational feature component (`<app-culinary-dish-list>`) under `src/app/features/culinary-guide/culinary-dish-list/` that renders the list of discovered culinary dishes using the shared `<app-accordion-group>` and `<app-accordion-item>` system. Supports configurable single and multi-expansion modes via pure two-way `[(expandedIds)]="expandedDishNames"` binding, surfaces native script pill badges in the header, uses clean `@if` control flow for progressive ingredients and instructions based on data presence alongside inline dual-instance `<app-skeleton>` loading placeholders with container geometry lock, encapsulates styling in `culinary-dish-list.component.css`, and binds sanitized recipe markdown with eagerly imported bottom diagnostics `<app-token-analytics>`.

**Blocked by:** Ticket 14: Build Shared Accessible Accordion Item Component with Integrated Chevron, Ticket 09: Culinary Guide State Service and Verification, and Ticket 02: Consolidate Shared Skeleton Components into Atomic AppSkeleton Primitive

**Status:** done  
**Last Updated:** 2026-10-19

- [x] Create `CulinaryDishListComponent` files in `src/app/features/culinary-guide/culinary-dish-list/`:
  - `culinary-dish-list.component.ts`
  - `culinary-dish-list.component.html`
  - `culinary-dish-list.component.css`
  - `culinary-dish-list.component.spec.ts`
- [x] Define reactive component signals and methods:
  - `dishes = input.required<CulinaryFoodItem[]>()`: array of discovered dishes.
  - `expandedDishNames = model<string[]>([])`: two-way signal tracking currently expanded dish names (bound directly to accordion group).
  - `recipes = input<Record<string, CulinaryRecipeDetail>>({})`: dictionary of loaded/cached recipe details keyed directly by `dish.name` (`CulinaryFoodItem.name`). The component uses `dish.name` as the lookup key (`recipes()[dish.name]`) to render recipe details, keeping the coordinator's internal compound `${country}:${city}:${dishName}` cache key private to `CulinaryGuideCoordinatorService`.
  - `isMulti = input(true)`: configurable boolean input toggling multi-expansion mode on the accordion group.
  - `dishSelected = output<CulinaryFoodItem>()`: event emitted when a dish accordion expands, passing the selected `CulinaryFoodItem` directly to the parent to let the parent decide whether to retrieve the recipe or consume from cache.
  - `isDishExpanded(dishName: string): boolean`: helper method returning `this.expandedDishNames().includes(dishName)`.
  - `onDishToggle(dish: CulinaryFoodItem): void`: click handler bound on `<app-accordion-item>` host emitting `this.dishSelected.emit(dish)` strictly when expanding (`this.isDishExpanded(dish.name)`).
- [x] Encapsulate styling in `culinary-dish-list.component.css` with semantic classes:
  - `.dish-header`: `@apply flex flex-col gap-1 w-full text-left;`
  - `.dish-title-row`: `@apply flex items-center gap-2 flex-wrap;`
  - `.dish-name`: `@apply text-on-surface font-semibold text-lg;`
  - `.dish-native-badge`: `@apply font-mono text-xs px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium;`
  - `.dish-description`: `@apply text-sm text-on-surface-variant line-clamp-2 md:line-clamp-none mt-1;`
  - `.dish-body`: `@apply grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 max-h-[60vh] md:max-h-[70vh] overflow-y-auto overscroll-contain;`
  - `.dish-instructions`: `@apply space-y-4 min-h-[160px];`
- [x] Wrap dish collection in template with `<app-accordion-group [isMulti]="isMulti()" [(expandedIds)]="expandedDishNames">`, iterating over `dishes()` tracked by `dish.name` with `<app-accordion-item [id]="dish.name" (click)="onDishToggle(dish)">`.
- [x] Populate the `[accordion-header]` slot (`<div accordion-header class="dish-header">`) without click handlers (satisfying ESLint a11y rules) for each dish:
  - English dish name wrapped in `.dish-name`.
  - Native script pill badge (`.dish-native-badge`) rendered conditionally when `dish.nativeName?.trim()` is defined.
  - Concise dish description styled with `.dish-description`.
- [x] Populate the `[accordion-body]` slot (`<div accordion-body class="dish-body">`) using data-driven `@if` control flow, resolving `recipeDetail` via `@let recipeDetail = recipes()[dish.name]`:
  - **Ingredients Presentation & Placeholder**: Render directly without extra `<h4>` heading. When `recipeDetail?.ingredients?.length`, render real ingredients as a list; when ingredients have not yet arrived (`!recipeDetail?.ingredients?.length`), render a 2-line placeholder: `<app-skeleton variant="line" [lines]="2" class="w-48" />`.
  - **Recipe Synthesis Skeleton**: In the instructions slot (`.dish-instructions` with `min-h-[160px]`). When `!recipeDetail?.recipeHtml`, compose `<app-skeleton variant="line" [lines]="4" class="w-full" />` inside a container marked with `aria-busy="true"` and an accessible screen-reader notice (`<span class="sr-only">Generating recipe instructions...</span>`).
  - **Completed Recipe View**: When `recipeDetail?.recipeHtml` is available, render formatted sanitized HTML via `[innerHTML]`.
  - **Diagnostics (<app-token-analytics>)**: Import `TokenAnalyticsComponent` directly in `CulinaryDishListComponent.imports` (no nested `@defer` to avoid double-deferral jaggy loading). Render at the bottom of the recipe body strictly when `recipeDetail?.tokenSummary` is present: `@if (recipeDetail?.tokenSummary; as summary) { <app-token-analytics [tokenSummary]="summary" [tokenModalityBreakdown]="recipeDetail?.tokenModalityBreakdown" /> }`.
- [x] Create unit tests in `culinary-dish-list.component.spec.ts` asserting:
  - Correct rendering of dishes list, titles, descriptions, and conditional native badges when `dish.nativeName?.trim()` is present.
  - Clicking a collapsed dish trigger expands the item and emits `dishSelected` with the complete `CulinaryFoodItem` object to the parent.
  - Clicking an expanded dish trigger collapses the item and does not emit `dishSelected`.
  - Direct data presence logic: renders 2-line ingredients skeleton and 4-line instructions skeleton with `aria-busy="true"` when `recipeDetail` is absent.
  - Display of progressive ingredients replaces the ingredients skeleton while keeping the 4-line instructions skeleton until `recipeHtml` arrives.
  - Transition from `<app-skeleton>` instructions placeholder to sanitized recipe HTML and `<app-token-analytics>` on completion.
  - Toggling `isMulti` controls accordion group expansion behavior.
  - Programmatic collapse of all dish accordions when `expandedDishNames.set([])` is called.
- [x] Follow repository invariants: zero `!`, zero `../`, native `#` for private state/deps, and TypeScript `private` for methods.
