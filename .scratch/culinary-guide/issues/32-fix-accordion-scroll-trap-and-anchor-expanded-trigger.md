# 32: Fix Accordion Scroll Trap, Natural Workspace Height, and Anchor Expanded Trigger Button

**What to build:** Remove `min-h-[calc(100vh-8rem)]` and `.culinary-dish-section { @apply flex-1; }` from `CulinaryGuideComponent` so `/culinary-guide` relies on `AppComponent`'s root `min-h-screen` + `flex-grow` layout and renders without an initial vertical scrollbar or clipped footer. Remove the nested scroll container (`max-h-[60vh] md:max-h-[70vh] overflow-y-auto overscroll-contain`) from `.dish-body` in `CulinaryDishListComponent` so expanded recipe panels flow naturally with the main page document without trapping wheel/trackpad scroll events. In `AccordionItemComponent`, add `#triggerButton` and `scroll-mt-20` (`scroll-margin-top: 5rem`) to `<button class="accordion-trigger">` and invoke `scrollIntoView?.({ behavior: 'smooth', block: 'nearest' })` inside `afterRenderEffect` when `isExpanded()` is `true` so newly expanded accordion headers remain anchored below the fixed top navigation bar.

**Blocked by:** None (can start immediately)

**Status:** to_progress

## Acceptance Criteria & Implementation Checklist

### 1. Remove Nested Scroll Container in Culinary Dish List (`src/app/features/culinary-guide/culinary-dish-list/`)

- [x] Update `.dish-body` in `src/app/features/culinary-guide/culinary-dish-list/culinary-dish-list.component.css` to remove `max-h-[60vh] md:max-h-[70vh] overflow-y-auto overscroll-contain`:

  ```css
  .dish-body {
    @apply flex flex-col gap-6 pt-4;
  }
  ```

### 1b. Remove Initial Viewport Overflow in Culinary Guide (`src/app/features/culinary-guide/`)

- [x] Update `src/app/features/culinary-guide/culinary-guide.component.css` to remove `min-h-[calc(100vh-8rem)]` from `.culinary-guide-container` and delete `.culinary-dish-section`:

  ```css
  @reference "../../../styles.css";

  .culinary-guide-container {
    @apply flex flex-col gap-8 max-w-(--spacing-container-max) mx-auto px-4 py-8;
  }
  ```

- [x] Unwrap `<div class="culinary-dish-section">` in `src/app/features/culinary-guide/culinary-guide.component.html` so all three `@defer` blocks sit directly inside `.culinary-guide-container`:

  ```html
  <div class="culinary-guide-container">
    @let culinaryDestinationList = culinaryDestinations(); @defer (when culinaryDestinationList.length > 0) {
    <app-culinary-search-box
      [destinations]="culinaryDestinationList"
      [isLoading]="isDiscovering()"
      (locationSelected)="search($event)"
    />
    } @let dishList = dishes(); @defer (when dishList.length > 0) {
    <app-culinary-dish-list
      [dishes]="dishList"
      [(expandedDishNames)]="expandedDishNames"
      [recipes]="recipes()"
      [isMulti]="false"
      [isDisabled]="isDiscovering()"
      (dishSelected)="loadRecipe($event)"
    />
    } @placeholder {
    <div class="section-card">
      <p class="empty-state-text">Iconic dishes will appear here once you search for a destination.</p>
    </div>
    } @defer (when discoveryData()) {
    <app-culinary-discovery-panel [discovery]="discoveryData()" />
    } @placeholder {
    <div class="section-card">
      <p class="empty-state-text">
        Culinary discovery insights and token analytics will appear here after a destination is selected.
      </p>
    </div>
    }
  </div>
  ```

### 2. Anchor Expanded Accordion Trigger Button (`src/app/shared/ui/components/accordion/`)

- [x] Add template reference `#triggerButton` to the trigger `<button>` in `src/app/shared/ui/components/accordion/accordion-item.component.html`:

  ```html
  <button
    #triggerButton
    type="button"
    class="accordion-trigger"
    [attr.id]="headerId"
    [attr.aria-expanded]="isExpanded()"
    [disabled]="isDisabled()"
    [attr.aria-disabled]="isDisabled()"
    [attr.aria-controls]="panelId"
    (click)="toggle()"
  ></button>
  ```

- [x] Add `scroll-mt-20` (`scroll-margin-top: 5rem`) to `.accordion-trigger` in `src/app/shared/ui/components/accordion/accordion-item.component.css` to clear the fixed `h-16` (`4rem`) top navigation bar with `1rem` spacing:

  ```css
  .accordion-trigger {
    @apply flex w-full items-center justify-between gap-4 p-4 text-left cursor-pointer transition-colors rounded-2xl scroll-mt-20;
  }
  ```

- [x] Query `triggerButton` with `viewChild.required<ElementRef<HTMLButtonElement>>('triggerButton')` and scroll it into view inside `afterRenderEffect` when `this.isExpanded()` is `true` in `src/app/shared/ui/components/accordion/accordion-item.component.ts`:

  ```ts
  import { ExpandMoreIconComponent } from '@/shared/ui/icons/expand-more-icon/expand-more-icon.component';
  import { afterRenderEffect, Component, computed, ElementRef, inject, input, output, viewChild } from '@angular/core';
  import { ACCORDION_GROUP_CONTEXT } from './accordion-context.const';

  @Component({
    selector: 'app-accordion-item',
    imports: [ExpandMoreIconComponent],
    templateUrl: './accordion-item.component.html',
    styleUrl: './accordion-item.component.css',
  })
  export class AccordionItemComponent {
    readonly #accordionGroup = inject(ACCORDION_GROUP_CONTEXT);

    id = input.required<string>();
    isDisabled = input(false);

    readonly triggerButton = viewChild.required<ElementRef<HTMLButtonElement>>('triggerButton');

    isExpanded = computed(() => this.#accordionGroup.isItemExpanded(this.id()));

    expandedChange = output<boolean>();

    constructor() {
      afterRenderEffect(() => {
        if (this.isExpanded()) {
          this.triggerButton().nativeElement.scrollIntoView?.({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      });
    }

    toggle(): void {
      if (this.isDisabled()) {
        return;
      }
      this.#accordionGroup.toggleItem(this.id());
      this.expandedChange.emit(this.isExpanded());
    }
  }
  ```

### 3. Architecture Documentation (`docs/adr/0030-culinary-guide-deferral-boundaries-and-accordion-diagnostics.md`)

- [x] Update `docs/adr/0030-culinary-guide-deferral-boundaries-and-accordion-diagnostics.md` to record that `.dish-body` flows naturally with the root document scrollport (without nested `overflow-y-auto overscroll-contain` traps) and `AccordionItemComponent` smoothly anchors `#triggerButton` (`scroll-mt-20` + `block: 'nearest'`) when expanded.

### 4. Unit Tests (`src/app/shared/ui/components/accordion/accordion-item.component.spec.ts`)

- [x] Add unit tests in `src/app/shared/ui/components/accordion/accordion-item.component.spec.ts` verifying:
  - When `isExpanded()` becomes `true`, `triggerButton().nativeElement.scrollIntoView` is called with `{ behavior: 'smooth', block: 'nearest' }`.
  - When `isExpanded()` is `false` (or transitions from `true` to `false`), `scrollIntoView` is not called.
- [x] Run targeted unit tests for `accordion-item.component.spec.ts` and `culinary-dish-list.component.spec.ts` and verify all test cases pass with zero errors.
