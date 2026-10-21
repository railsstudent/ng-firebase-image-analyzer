# 30: Disable Accordion Items During Stage 1 Culinary Discovery Streaming

**What to build:** Prevent users from expanding dish accordion items while Stage 1 Culinary Discovery (`isDiscovering()`) is actively streaming partial dishes so that expanding an in-flight item does not immediately collapse on the next Stage 1 stream update. Once Stage 1 completes, accordion items become interactive and remain expandable during Stage 2 Recipe Synthesis (`loadRecipe`) so the ingredients, recipe instructions, and token analytics skeletons render as expected.

**Blocked by:** None (can start immediately)

**Status:** done

## Acceptance Criteria & Implementation Checklist

### 1. Shared Accordion Item Disabled State (`src/app/shared/ui/components/accordion/`)

- [x] Add `isDisabled = input(false);` and guard `toggle()` with early return when disabled in `src/app/shared/ui/components/accordion/accordion-item.component.ts`:

  ```ts
  id = input.required<string>();
  isDisabled = input(false);
  expandedChange = output<boolean>();
  ```

  ```ts
  toggle(): void {
    if (this.isDisabled()) {
      return;
    }
    this.#accordionGroup.toggleItem(this.id());
    this.expandedChange.emit(this.isExpanded());
  }
  ```

- [x] Bind native `[disabled]="isDisabled()"` on the trigger `<button>` in `src/app/shared/ui/components/accordion/accordion-item.component.html` (per `modern-web-guidance` HTML button semantics):

  ```html
  <button
    type="button"
    class="accordion-trigger"
    [attr.id]="headerId"
    [attr.aria-expanded]="isExpanded()"
    [attr.aria-controls]="panelId"
    [disabled]="isDisabled()"
    [attr.aria-disabled]="isDisabled()"
    (click)="toggle()"
  ></button>
  ```

- [x] Style `:disabled` on `.accordion-trigger` in `src/app/shared/ui/components/accordion/accordion-item.component.css`:

  ```css
  .accordion-trigger:disabled {
    @apply opacity-50 cursor-not-allowed;
  }
  ```

### 2. Culinary Dish List & Culinary Guide Stage 1 Lock (`src/app/features/culinary-guide/`)

- [x] Add `isDisabled = input(false);` to `CulinaryDishListComponent` in `src/app/features/culinary-guide/culinary-dish-list/culinary-dish-list.component.ts`:

  ```ts
  dishes = input.required<CulinaryFoodItem[]>();
  expandedDishNames = model<string[]>([]);
  recipes = input<Record<string, CulinaryRecipeDetail>>({});
  isMulti = input(true);
  isDisabled = input(false);
  ```

- [x] Forward `[isDisabled]="isDisabled()"` to `<app-accordion-item>` in `src/app/features/culinary-guide/culinary-dish-list/culinary-dish-list.component.html`:

  ```html
  <app-accordion-item
    [id]="dish.name"
    [isDisabled]="isDisabled()"
    (expandedChange)="onDishToggle(dish, $event)"
  ></app-accordion-item>
  ```

- [x] Bind `[isDisabled]="isDiscovering()"` on `<app-culinary-dish-list>` in `src/app/features/culinary-guide/culinary-guide.component.html` (Stage 1 only—do not disable during Stage 2 `loadRecipe` so the ingredients, recipe instructions, and token analytics skeletons remain visible when expanding a dish):

  ```html
  <app-culinary-dish-list
    [dishes]="dishList"
    [(expandedDishNames)]="expandedDishNames"
    [recipes]="recipes()"
    [isMulti]="false"
    [isDisabled]="isDiscovering()"
    (dishSelected)="loadRecipe($event)"
  />
  ```

### 3. Architecture Documentation (`docs/adr/0029-internal-stream-aggregation-for-structured-generative-output.md`)

- [x] Document in ADR-0029 that `<app-accordion-item>` instances in `<app-culinary-dish-list>` are disabled while Stage 1 (`isDiscovering()`) is streaming to prevent premature expansion/collapse race conditions, and unlocked as soon as Stage 1 settles so Stage 2 (`loadRecipe`) can display its progressive skeleton states.

### 4. Unit Tests

- [x] Add unit tests in `src/app/shared/ui/components/accordion/accordion-item.component.spec.ts` verifying that when `isDisabled` is `true`, the native `<button>` has `disabled === true`, clicking the trigger does not expand the panel, and `expandedChange` is not emitted.
- [x] Add unit tests in `src/app/features/culinary-guide/culinary-dish-list/culinary-dish-list.component.spec.ts` and `src/app/features/culinary-guide/culinary-guide.component.spec.ts` verifying `[isDisabled]="isDiscovering()"` locks dish accordion triggers during Stage 1 streaming and re-enables them once Stage 1 completes.
- [x] Run targeted unit tests for `accordion-item.component.spec.ts`, `culinary-dish-list.component.spec.ts`, and `culinary-guide.component.spec.ts` and verify all test cases pass with zero errors.
