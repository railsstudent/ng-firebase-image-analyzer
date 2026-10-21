# 28: Defer Culinary Guide Middle Dish List and Bottom Discovery Panels with Placeholders

**What to build:**
Wrap the middle dish list and bottom discovery panel sections in `@defer` with informative glassmorphic placeholder cards in `culinary-guide.component.html`, reference `ADR-0030` superseding `ADR-0028`, and update comprehensive unit tests in `culinary-guide.component.spec.ts`.

**Blocked by:** 25: Implement Culinary Guide Layout, Race Guard, Cache Bypass, and Test Suite, 26: Fix Culinary Guide and Culinary Dish List Layout, 27: Add Culinary Dish List Empty State and Deferred Full-Width Token Analytics

**Status:** done

- [x] Import `section-card.css` and `empty-state.css` via `styleUrls` in `culinary-guide.component.ts`:

  ```typescript
  @Component({
    selector: 'app-culinary-guide',
    templateUrl: './culinary-guide.component.html',
    styleUrls: [
      './culinary-guide.component.css',
      '../../shared/ui/styles/section-card.css',
      '../../shared/ui/styles/empty-state.css',
    ],
    ...
  })
  ```

- [ ] In `culinary-guide.component.html`, inside `<div class="culinary-dish-section">`, wrap `<app-culinary-dish-list>` in `@defer (when dishes().length > 0)`:

  ```html
  <div class="culinary-dish-section">
    @defer (when dishes().length > 0) {
    <app-culinary-dish-list
      [dishes]="dishes()"
      [(expandedDishNames)]="expandedDishNames"
      [recipes]="recipes()"
      [isMulti]="false"
      (dishSelected)="loadRecipe($event)"
    />
    } @placeholder {
    <div class="section-card">
      <p class="empty-state-text">Iconic dishes will appear here once you search for a destination.</p>
    </div>
    }
  </div>
  ```

- [x] In `culinary-guide.component.html`, wrap `<app-culinary-discovery-panel>` in `@defer (when discoveryData())`:

  ```html
  @defer (when discoveryData()) {
  <app-culinary-discovery-panel [discovery]="discoveryData()" />
  } @placeholder {
  <div class="section-card">
    <p class="empty-state-text">
      Culinary discovery insights and token analytics will appear here after a destination is selected.
    </p>
  </div>
  }
  ```

- [x] Create `docs/adr/0030-culinary-guide-deferral-boundaries-and-accordion-diagnostics.md` superseding `ADR-0028` with the Culinary Guide 3-tier `@defer` boundaries and Stage 2 deferred token analytics
- [x] Update `docs/adr/0028-culinary-guide-two-stage-inference-and-lazy-markdown.md` status to `Superseded by ADR-0030`
- [x] Update `culinary-guide.component.spec.ts` unit tests covering:
  - Initial placeholder card rendering prior to search
  - `@defer` blocks hydration when search executes and data arrives
- [ ] Ensure all unit tests in `culinary-guide.component.spec.ts` pass with zero regressions
