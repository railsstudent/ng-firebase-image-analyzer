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
  - Input: `destinations = input.required<CulinaryDestination[]>();`.
  - Output: `locationSelected = output<CulinaryLocation>()`.
  - **Signal Form Model & Validation**:
    - Define private `readonly #locationModel = linkedSignal<CulinaryDestination[], CulinaryLocation>({ source: this.destinations, computation: (destinations) => ({ country: destinations[0]?.country ?? '', city: destinations[0]?.cities[0] ?? '' }) })`.
    - Pass the model to Signal Forms: `readonly searchForm = form(this.#locationModel, (schema) => { required(schema.country); required(schema.city); debounce(schema.city, BLUR_CLOSE_DELAY_MS); validate(schema.city, ({ value, valueOf }) => { const validCities = this.getCitiesForCountry(valueOf(schema.country)); const exists = validCities.some((c) => c.toLowerCase() === value().trim().toLowerCase()); return exists ? null : { kind: 'invalidCity', message: 'City is not in selected country' }; }); })`.
  - **Reactivity & Country Cascade**:
    - When country `<select>` changes via `onCountryChange(newCountryName: string)`:
      - Look up the new country's first city via `getCitiesForCountry(newCountryName)?.[0] ?? ''`.
      - Update the model: `this.#locationModel.set({ country: newCountryName, city: firstCity })`.
      - Close suggestions listbox: `this.toggleDropdown(false)`.
  - **City Autocomplete & Filtered Options**:
    - `isDropdownOpen = signal(false)`.
    - `activeOptionIndex = signal(-1)`.
    - `#lowercaseCity = computed(() => this.#locationModel().city.trim().toLowerCase())`.
    - `filteredCities = computed(() => { const query = this.#lowercaseCity(); const cities = this.getCitiesForCountry(this.#locationModel().country); return query ? cities.filter((city) => city.toLowerCase().includes(query)) : cities; })`.
    - `cityOptionId = computed(() => this.activeOptionIndex() >= 0 ? \`city-option-\${this.activeOptionIndex()}\` : null)`.
    - `selectCity(city: string, event?: Event)`: updates `#locationModel` with selected city and delegates closure to `toggleDropdown(false, event)`.
    - `navigateOptions(direction: 'up' | 'down')`: updates `activeOptionIndex` with wrap-around across filtered options.
    - `onEnter(event: Event)`: selects currently active option from keyboard navigation.
  - **Submission (`onSubmit`)**:
    - `onSubmit(event?: Event): void`:
      - Call `event?.preventDefault()`.
      - Guard: `if (this.searchForm().valid()) { this.isDropdownOpen.set(false); this.locationSelected.emit(this.#locationModel()); }`.
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
  - Country `<select class="select-control" [formField]="searchForm.country" #countrySelect (change)="onCountryChange(countrySelect.value)">` iterating `@for (item of destinations(); track item.country)`.
  - City typeahead combobox (`<input class="input-control" role="combobox" aria-haspopup="listbox" aria-autocomplete="list" [attr.aria-expanded]="isDropdownOpen()" aria-controls="city-listbox" [attr.aria-activedescendant]="cityOptionId()" [formField]="searchForm.city" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" ...>`).
  - Suggestions dropdown `<ul class="listbox-overlay" role="listbox">` with `<li class="listbox-option" [class.listbox-option-active]="activeOptionIndex() === i" role="option">`.
  - Search submit button `<button class="submit-btn" type="submit" [disabled]="searchForm().invalid()" [attr.aria-disabled]="searchForm().invalid()">`.
- [x] Create unit test suite in `src/app/features/culinary-guide/culinary-search-box/culinary-search-box.component.spec.ts`:
  - Verify initial country and city match the first entry in `destinations()`.
  - Verify switching country cascades and resets city to the first city of the new country.
  - Verify typing/selecting city filters matching suggestions in real-time.
  - Verify keyboard navigation (`ArrowDown`, `ArrowUp`, `Enter`, `Escape`) cycles and selects suggestions.
  - Verify selecting an option updates `#locationModel` and closes the dropdown listbox.
  - Verify submit button is disabled and form is invalid when city does not match any entry in active country.
  - Verify form submit emits the `locationSelected` output with `{ country, city }` (`CulinaryLocation`).
- [x] Validate targeted intermediate test execution:
  - Run `npm run test:spec src/app/features/culinary-guide/culinary-search-box/culinary-search-box.component.spec.ts` (8/8 tests passing).
