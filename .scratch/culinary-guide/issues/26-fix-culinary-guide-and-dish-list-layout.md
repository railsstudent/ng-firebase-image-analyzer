# 26: Fix Culinary Guide and Culinary Dish List Layout

**What to build:**
Update `CulinaryGuideComponent` to use a full-height flex column container (`.culinary-guide-container` + `.culinary-dish-section` `flex-1`) so the bottom discovery panel is pushed to the bottom of the workspace, and refactor `CulinaryDishListComponent`'s expanded accordion body (`.dish-body`) into a vertical flex stack containing a top 2-column grid (`.dish-content-grid` with a wider 2:3 / 40% : 60% ratio on `md:` viewports and wrapped recipe prose). (Note: Token analytics and empty states are delegated to Ticket 27).

**Blocked by:** 23: Export Canonical Key Normalization and Adopt Across Feature Components, 25: Implement Culinary Guide Layout, Race Guard, Cache Bypass, and Test Suite

**Status:** ready-for-agent

- [ ] Update `culinary-guide.component.css`:

  ```css
  @reference "../../../styles.css";

  .culinary-guide-container {
    @apply flex flex-col gap-8 min-h-[calc(100vh-8rem)] max-w-(--spacing-container-max) mx-auto px-4 py-8;
  }

  .culinary-dish-section {
    @apply flex-1;
  }
  ```

- [ ] In `culinary-guide.component.html`, wrap the dish list area inside `<div class="culinary-dish-section">...</div>`:

  ```html
  <div class="culinary-dish-section">
    <app-culinary-dish-list
      [dishes]="dishes()"
      [(expandedDishNames)]="expandedDishNames"
      [recipes]="recipes()"
      [isMulti]="false"
      (dishSelected)="loadRecipe($event)"
    />
  </div>
  ```

- [ ] Update `culinary-dish-list.component.css`:

  ```css
  @reference "../../../../styles.css";

  .dish-header {
    @apply flex flex-col gap-1 w-full text-left;
  }

  .dish-title-row {
    @apply flex items-center gap-2 flex-wrap;
  }

  .dish-name {
    @apply text-on-surface font-semibold text-lg;
  }

  .dish-native-badge {
    @apply font-mono text-xs px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium;
  }

  .dish-description {
    @apply text-sm text-on-surface-variant line-clamp-2 md:line-clamp-none mt-1;
  }

  .dish-body {
    @apply flex flex-col gap-6 pt-4 max-h-[60vh] md:max-h-[70vh] overflow-y-auto overscroll-contain;
  }

  .dish-content-grid {
    @apply grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-6 items-start;
  }

  .dish-instructions {
    @apply space-y-4 min-h-[160px] min-w-0 wrap-break-word [&_pre]:whitespace-pre-wrap [&_pre]:font-sans [&_code]:whitespace-pre-wrap [&_code]:font-sans;
  }
  ```

- [ ] Restructure `<div accordion-body class="dish-body">` in `culinary-dish-list.component.html`:

  ```html
  <div accordion-body class="dish-body">
    @let recipeDetail = getRecipeDetail(dish);
    <div class="dish-content-grid">
      <div class="space-y-2">
        @if (!recipeDetail?.ingredients?.length) {
        <app-skeleton variant="line" [lines]="2" class="w-48" />
        } @else {
        <ul class="list-disc pl-5 space-y-1 text-sm text-on-surface">
          @for (ingredient of recipeDetail?.ingredients; track $index) {
          <li>{{ ingredient }}</li>
          }
        </ul>
        }
      </div>

      <div class="dish-instructions">
        @if (!recipeDetail?.recipeHtml) {
        <div aria-busy="true">
          <span class="sr-only">Generating recipe instructions...</span>
          <app-skeleton variant="line" [lines]="4" class="w-full" />
        </div>
        } @else {
        <div [innerHTML]="recipeDetail?.recipeHtml"></div>
        }
      </div>
    </div>
  </div>
  ```

- [x] Sync `DESIGN.md` Sections 7.3 and 9.1 with the updated layout tokens and column ratios
- [ ] Ensure all unit tests in `culinary-dish-list.component.spec.ts` and `culinary-guide.component.spec.ts` pass with zero regressions
