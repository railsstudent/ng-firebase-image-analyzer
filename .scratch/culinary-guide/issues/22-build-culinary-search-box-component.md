# 22: Build CulinarySearchBoxComponent with Signal Forms and City Autocomplete Combobox

**What to build:** Document the Culinary Destination Selector and City Autocomplete Combobox design and accessibility specifications in `DESIGN.md`, add the canonical entry to `GLOSSARY.md`, and build the standalone `CulinarySearchBoxComponent` (`app-culinary-search-box`) under `src/app/features/culinary-guide/culinary-search-box/` with Signal Forms (`form()`), dynamic country-to-city reactivity, WAI-ARIA combobox typeahead filtering, and strict dataset validation.

**Blocked by:** 21: Build CulinaryDiscoveryPanelComponent with Dual Tabs and Update Glossary

**Status:** done

- [x] In `DESIGN.md`, append **Section 8: Culinary Destination Selector & Autocomplete System**:
  - Document responsive flex layout using glassmorphic tokens (`glass-card`, `surface-glass`, `surface-glass-border`).
  - Document WAI-ARIA 1.2 Combobox accessibility specs (`role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, `aria-controls`, `role="listbox"`, `role="option"`, `aria-activedescendant`).
  - Document Keyboard Navigation Matrix (`ArrowDown`, `ArrowUp`, `Enter`, `Escape`, `Tab`).
  - Document strict dataset validation and disabled submission states.
- [x] In `GLOSSARY.md`, add **Culinary Destination Selector** to the `Language` section:
  - Definition: The presentational search component allowing travelers to filter destinations by country and city with typeahead autocomplete to initiate Culinary Discovery.
  - _Avoid_: Food search bar, city picker, country box.
- [x] Create `CulinarySearchBoxComponent` in `src/app/features/culinary-guide/culinary-search-box/culinary-search-box.component.ts`:
  - Selector: `app-culinary-search-box`.
  - Style: `styleUrl: './culinary-search-box.component.css'`.
  - Input: `dataset = input.required<DestinationDataset>()`.
  - Output: `search = output<CulinaryLocation>()`.
  - **Signal Form Model Construction**:
    - Define `readonly locationModel = signal<CulinaryLocation>({ country: '', city: '' })` initialized from the first entry of `dataset().data` (`{ country: data[0]?.country ?? '', city: data[0]?.cities[0] ?? '' }`).
    - Pass the model to Signal Forms: `readonly searchForm = form(this.locationModel)` from `@angular/forms/signals`.
  - **Reactivity & Country Cascade**:
    - When country `<select>` changes via `onCountryChange(country: string)`:
      - Look up the new country's first city (`newCountry.cities[0] ?? ''`).
      - Update the model: `this.locationModel.set({ country, city: firstCity })`.
      - Reset `filterQuery` and close suggestions listbox.
  - **City Autocomplete & Filtered Options**:
    - `filterQuery = signal<string>('')`.
    - `isDropdownOpen = signal<boolean>(false)`.
    - `activeOptionIndex = signal<number>(-1)`.
    - `currentCountryCities = computed(() => this.dataset().data.find(d => d.country === this.locationModel().country)?.cities ?? [])`.
    - `filteredCities = computed(() => { const q = this.filterQuery().toLowerCase().trim(); const cities = this.currentCountryCities(); return q ? cities.filter(c => c.toLowerCase().includes(q)) : cities; })`.
    - `selectCity(city: string)`: updates `this.locationModel.update(m => ({ ...m, city }))`, syncs `filterQuery`, and closes the listbox.
  - **Validation (`isValidSelection`)**:
    - Computed boolean: `readonly isValidSelection = computed<boolean>(() => { const countryMatch = this.dataset().data.find(d => d.country === this.locationModel().country); const currentCity = this.locationModel().city.trim().toLowerCase(); return !!countryMatch && countryMatch.cities.some(c => c.toLowerCase() === currentCity); })`.
  - **Submission (`onSubmit`)**:
    - `onSubmit(event?: Event): void`:
      - Call `event?.preventDefault()`.
      - Guard: `if (!this.isValidSelection()) return;`.
      - Close suggestions overlay: `this.isDropdownOpen.set(false)`.
      - Emit location payload: `this.search.emit({ country: this.locationModel().country, city: this.locationModel().city })`.
  - Invariant: Do not create a barrel file (`index.ts`) in the feature directory.
- [x] Create component stylesheet `src/app/features/culinary-guide/culinary-search-box/culinary-search-box.component.css`:
  - Directive: `@reference "../../../../styles.css";`
  - `.search-box-card`: `@apply p-4 md:p-6 rounded-2xl backdrop-blur-md bg-surface-glass border border-surface-glass-border dark:bg-surface-glass-dark dark:border-surface-glass-border-dark shadow-sm;`
  - `.search-form`: `@apply flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full;`
  - `.form-group`: `@apply flex flex-col gap-1.5 flex-1 relative;`
  - `.form-label`: `@apply text-xs font-semibold tracking-wider uppercase text-on-surface-variant;`
  - `.select-control`: `@apply w-full px-4 py-2.5 rounded-xl border border-outline/30 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all;`
  - `.input-control`: `@apply w-full px-4 py-2.5 rounded-xl border border-outline/30 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-outline;`
  - `.listbox-overlay`: `@apply absolute left-0 right-0 top-full mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-outline-variant bg-surface-container-high shadow-lg z-50 p-1 list-none m-0;`
  - `.listbox-option`: `@apply px-3.5 py-2 rounded-lg text-sm text-on-surface cursor-pointer select-none transition-colors hover:bg-surface-container-highest;`
  - `.listbox-option-active`: `@apply bg-primary/10 text-primary font-medium;`
  - `.submit-btn`: `@apply px-6 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm transition-all shadow-md hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed sm:self-end;`
- [x] Create template `src/app/features/culinary-guide/culinary-search-box/culinary-search-box.component.html`:
  - Wrap in `<div class="search-box-card">`.
  - Accessible `<form class="search-form" (submit)="onSubmit($event)">` container.
  - Country `<select class="select-control">` paired with `<label class="form-label">`.
  - City typeahead combobox (`<input class="input-control" role="combobox" ...>`) paired with `<label class="form-label">`.
  - Suggestions dropdown `<ul class="listbox-overlay" role="listbox">` with `<li class="listbox-option" [class.listbox-option-active]="activeOptionIndex() === i" role="option">`.
  - Search submit button `<button class="submit-btn" type="submit" [disabled]="!isValidSelection()">`.
- [x] Create unit test suite in `src/app/features/culinary-guide/culinary-search-box/culinary-search-box.component.spec.ts`:
  - Verify initial country and city match the first entry in `dataset()`.
  - Verify switching country cascades and resets city to the first city of the new country.
  - Verify typing in city input filters matching suggestions in real-time.
  - Verify keyboard navigation (`ArrowDown`, `ArrowUp`, `Enter`, `Escape`) cycles and selects suggestions.
  - Verify selecting an option updates `locationState` and closes the dropdown listbox.
  - Verify submit button is disabled when city does not match any entry in the active country's dataset.
  - Verify form submit emits the `search` output with `{ country, city }` (`CulinaryLocation`).
- [x] Validate targeted intermediate test execution:
  - Run `npx ng test --watch=false --include src/app/features/culinary-guide/culinary-search-box/culinary-search-box.component.spec.ts`.
