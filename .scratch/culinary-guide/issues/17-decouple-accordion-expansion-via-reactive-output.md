# 17: Decouple Accordion Item Expansion via Reactive Output and Isolate Culinary Dish Selection

**What to build:** Refactor the shared accordion item component to emit its expansion state directly via an `expandedChange` output signal upon toggle, enabling consumers like the culinary dish list to react cleanly to expansion changes without DOM event bubbling sniffing or feature-envying internal elements. Update the culinary dish list to bind to `(expandedChange)`, remove manual DOM target sniffing and private expansion checks, add comprehensive unit tests preventing regressions on body clicks, and update architectural documentation for compound child items.

**Blocked by:** 15: Build Culinary Dish List Component with Multi-Expansion and Native Badges

**Status:** done

- [x] Add `expandedChange = output<boolean>()` to `AccordionItemComponent` in `src/app/shared/ui/components/accordion/accordion-item.component.ts`.
- [x] In `AccordionItemComponent.toggle()`, invoke `this.#accordionGroup.toggleItem(this.id())` and synchronously emit the updated computed state: `this.expandedChange.emit(this.isExpanded())`. Strictly avoid using an Angular `effect()` to update reactive signals or trigger emissions.
- [x] Update `CulinaryDishListComponent` in `src/app/features/culinary-guide/culinary-dish-list/culinary-dish-list.component.ts`:
  - Replace `onDishToggle(dish: CulinaryFoodItem, event?: Event): void` with `onDishToggle(dish: CulinaryFoodItem, isExpanded: boolean): void`.
  - In `onDishToggle`, emit `this.dishSelected.emit(dish)` strictly when `isExpanded` is true, without inspecting DOM events or querying `isDishExpanded()`.
  - Remove unused `private isDishExpanded` helper method and remove `$event` parameter.
- [x] Update template `src/app/features/culinary-guide/culinary-dish-list/culinary-dish-list.component.html`:
  - Replace `(click)="onDishToggle(dish, $event)"` on `<app-accordion-item>` with `(expandedChange)="onDishToggle(dish, $event)"`.
- [x] Update documentation in `docs/architecture/component-context-pattern.md` under Tier 3 child item guidelines to document `expandedChange = output<boolean>()` on `AccordionItemComponent` for granular state observations.
- [x] Add unit test in `src/app/shared/ui/components/accordion/accordion-item.component.spec.ts` (or update existing):
  - Verify that clicking the accordion item toggle trigger invokes `toggle()` and emits `expandedChange` with `true` when expanding and `false` when collapsing.
- [x] Update unit tests in `src/app/features/culinary-guide/culinary-dish-list/culinary-dish-list.component.spec.ts`:
  - Verify that triggering `expandedChange` with `true` on `<app-accordion-item>` emits `dishSelected` with the corresponding dish.
  - Verify that triggering `expandedChange` with `false` does not emit `dishSelected`.
  - Verify regression test: clicking inside `.dish-body` (such as an ingredient item or instruction text) does not emit `dishSelected`.
- [x] Maintain repository standards: zero `!`, zero `../`, native `#` for private dependencies, TypeScript `private` for methods, and ensure all unit tests pass with `npx ng test --watch=false`.
