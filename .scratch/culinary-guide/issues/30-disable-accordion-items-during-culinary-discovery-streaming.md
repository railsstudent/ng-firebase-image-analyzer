# 30: Disable Accordion Items During Stage 1 Culinary Discovery Streaming

**What to build:** Prevent users from expanding dish accordion items while Stage 1 Culinary Discovery (`isDiscovering()`) is actively streaming partial dishes so that expanding an in-flight item does not immediately collapse on the next Stage 1 stream update. Once Stage 1 completes, accordion items become interactive and remain expandable during Stage 2 Recipe Synthesis (`loadRecipe`) so the ingredients, recipe instructions, and token analytics skeletons render as expected.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

## Acceptance Criteria & Implementation Checklist

### 1. Shared Accordion Item Disabled State (`src/app/shared/ui/components/accordion/`)

- [ ] Add `readonly isDisabled = input(false);` and guard `toggle()` in `src/app/shared/ui/components/accordion/accordion-item.component.ts`:

  ```ts
  readonly id = input.required<string>();
  readonly isDisabled = input(false);
  readonly opened = output();
  ```

  ```ts
  protected toggle(): void {
    if (this.isDisabled()) {
      return;
    }
    const wasExpanded = this.isExpanded();
    this.#group?.toggle(this.id());
    if (!wasExpanded && this.isExpanded()) {
      this.opened.emit();
    }
  }
  ```

- [ ] Bind native `[disabled]="isDisabled()"` on the trigger `<button>` in `src/app/shared/ui/components/accordion/accordion-item.component.html` (per `modern-web-guidance` HTML button semantics):

  ```html
  <button
    type="button"
    class="accordion-trigger"
    [id]="headerId()"
    [disabled]="isDisabled()"
    [attr.aria-expanded]="isExpanded()"
    [attr.aria-controls]="panelId()"
    (click)="toggle()"
  ></button>
  ```

- [ ] Style `:disabled` on `.accordion-trigger` in `src/app/shared/ui/components/accordion/accordion-item.component.css`:

  ```css
  .accordion-trigger:disabled {
    @apply opacity-50 cursor-not-allowed;
  }
  ```

### 2. Culinary Dish List & Culinary Guide Stage 1 Lock (`src/app/features/culinary-guide/`)

- [ ] Add `readonly isDisabled = input(false);` to `CulinaryDishListComponent` in `src/app/features/culinary-guide/culinary-dish-list/culinary-dish-list.component.ts`:

  ```ts
  readonly dishes = input.required<readonly DishIdentification[]>();
  readonly isDisabled = input(false);
  readonly recipesMap = input<Readonly<Record<string, DishRecipeState>>>({});
  ```

- [ ] Forward `[isDisabled]="isDisabled()"` to `<app-accordion-item>` in `src/app/features/culinary-guide/culinary-dish-list/culinary-dish-list.component.html`:

  ```html
  <app-accordion-item
    [id]="dish.dishName"
    [isDisabled]="isDisabled()"
    (opened)="dishSelected.emit(dish)"
  ></app-accordion-item>
  ```

- [ ] Bind `[isDisabled]="isDiscovering()"` on `<app-culinary-dish-list>` in `src/app/features/culinary-guide/culinary-guide.component.html` (Stage 1 only—do not disable during Stage 2 `loadRecipe` so the ingredients, recipe instructions, and token analytics skeletons remain visible when expanding a dish):

  ```html
  <app-culinary-dish-list
    [dishes]="result.dishes"
    [isDisabled]="isDiscovering()"
    [recipesMap]="recipesMap()"
    [dishAnalyticsMap]="dishAnalyticsMap()"
    (dishSelected)="loadRecipe($event)"
  />
  ```

### 3. Architecture Documentation (`docs/adr/0029-internal-stream-aggregation-for-structured-generative-output.md`)

- [ ] Document in ADR-0029 that `<app-accordion-item>` instances in `<app-culinary-dish-list>` are disabled while Stage 1 (`isDiscovering()`) is streaming to prevent premature expansion/collapse race conditions, and unlocked as soon as Stage 1 settles so Stage 2 (`loadRecipe`) can display its progressive skeleton states.

### 4. Unit Tests

- [ ] Add unit tests in `src/app/shared/ui/components/accordion/accordion-item.component.spec.ts` verifying that when `isDisabled` is `true`, the native `<button>` has `disabled === true`, clicking the trigger does not expand the panel, and `opened` is not emitted.
- [ ] Add unit tests in `src/app/features/culinary-guide/culinary-dish-list/culinary-dish-list.component.spec.ts` and `src/app/features/culinary-guide/culinary-guide.component.spec.ts` verifying `[isDisabled]="isDiscovering()"` locks dish accordion triggers during Stage 1 streaming and re-enables them once Stage 1 completes.
- [ ] Run targeted unit tests for `accordion-item.component.spec.ts`, `culinary-dish-list.component.spec.ts`, and `culinary-guide.component.spec.ts` and verify all test cases pass with zero errors.
