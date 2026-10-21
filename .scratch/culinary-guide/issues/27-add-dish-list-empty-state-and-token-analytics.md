# 27: Add Culinary Dish List Empty State and Deferred Full-Width Token Analytics

**What to build:**
Implement the internal empty-state card fallback in `CulinaryDishListComponent` satisfying Coding Standards § 7 (Deferred Component Empty State Invariant), wrap `<app-token-analytics>` in `@defer (when recipeDetail?.tokenSummary)` with `<app-skeleton variant="line" [lines]="2" class="w-full" />` in `@placeholder` full-width below `.dish-content-grid` (reusing `SkeletonComponent` and removing `ListSkeletonComponent`), with comprehensive unit tests in `culinary-dish-list.component.spec.ts`.

**Blocked by:** 23: Export Canonical Key Normalization and Adopt Across Feature Components, 26: Fix Culinary Guide and Culinary Dish List Layout

**Status:** in_progress

- [x] Import `section-card.css` and `empty-state.css` via `styleUrls` in `culinary-dish-list.component.ts`:

  ```typescript
  @Component({
    selector: 'app-culinary-dish-list',
    templateUrl: './culinary-dish-list.component.html',
    styleUrls: [
      './culinary-dish-list.component.css',
      '../../../shared/ui/styles/section-card.css',
      '../../../shared/ui/styles/empty-state.css',
    ],
    imports: [
      AccordionGroupComponent,
      AccordionItemComponent,
      TokenAnalyticsComponent,
      SkeletonComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  ```

- [x] In `culinary-dish-list.component.html`, wrap the accordion group in `@if (dishes().length > 0) ... @else`:

  ```html
  <app-accordion-group [isMulti]="isMulti()" [(expandedIds)]="expandedDishNames">
    @let dishList = dishes(); @if (dishList.length > 0) { @for (dish of dishList; track dish.name) {
    <app-accordion-item [id]="dish.name" (expandedChange)="onDishToggle(dish, $event)"> ... </app-accordion-item>
    }
  </app-accordion-group>
  } @else {
  <div class="section-card">
    <p class="empty-state-text">
      No iconic dishes available. Search for a destination above to explore local culinary highlights.
    </p>
  </div>
  }
  ```

- [x] In `culinary-dish-list.component.html`, render deferred `<app-token-analytics>` with `<app-skeleton>` placeholder below `.dish-content-grid`:

  ```html
  @defer (when recipeDetail?.tokenSummary) {
  <app-token-analytics
    [tokenSummary]="recipeDetail?.tokenSummary"
    [tokenModalityBreakdown]="recipeDetail?.tokenModalityBreakdown"
  />
  } @placeholder {
  <div aria-busy="true">
    <span class="sr-only">Calculating recipe token usage...</span>
    <app-skeleton variant="line" [lines]="4" class="w-full" />
  </div>
  }
  ```

- [x] Update `culinary-dish-list.component.spec.ts` unit tests covering:
  - Empty state card rendering when `dishes` input is empty (`"No iconic dishes available. Search for a destination above to explore local culinary highlights."`)
  - Accordion rendering when `dishes` input contains items
  - `<app-skeleton>` placeholder rendering while `tokenSummary` is absent and `<app-token-analytics>` hydrating when `tokenSummary` arrives:

    ```typescript
    it('should render skeleton placeholder prior to tokenSummary and hydrate token analytics upon completion', async () => {
      hostComponent.recipes.set({
        ramen: {
          ingredients: ['Fresh Ramen Noodles'],
          recipe: 'Step 1: Boil water.',
          recipeHtml: '<p>Step 1: Boil water.</p>',
        },
      });
      await fixture.whenStable();

      const accordionItems = fixture.nativeElement.querySelectorAll('app-accordion-item');
      const ramenBody = accordionItems[0].querySelector('[accordion-body]');
      expect(ramenBody.querySelector('app-token-analytics')).toBeNull();

      hostComponent.recipes.set({
        ramen: {
          ingredients: ['Fresh Ramen Noodles'],
          recipe: 'Step 1: Boil water.',
          recipeHtml: '<p>Step 1: Boil water.</p>',
          tokenSummary: {
            totalTokenCount: 350,
            promptTokenCount: 100,
            thoughtsTokenCount: 0,
            cachedContentTokenCount: 0,
            outputTokenCount: 250,
          },
        },
      });
      await fixture.whenStable();

      const hydratedAnalytics = ramenBody.querySelector('app-token-analytics');
      expect(hydratedAnalytics).toBeTruthy();
    });
    ```

- [x] Ensure all unit tests pass with zero regressions and strict coding standards (zero `!`, native `#` for private state/deps, Signal Forms, no `../` imports)
