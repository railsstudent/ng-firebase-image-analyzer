import type { CulinaryDestination, CulinaryLocation } from '@/core/culinary-guide';
import { normalizeKeys } from '@/core/culinary-guide/culinary-guide.normalization';
import { SyncIconComponent } from '@/shared/ui/icons/sync-icon/sync-icon.component';
import type { ElementRef } from '@angular/core';
import {
  afterRenderEffect,
  Component,
  computed,
  input,
  linkedSignal,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { debounce, form, FormField, required, validate } from '@angular/forms/signals';

const NO_SELECTION_INDEX = -1;
const CITY_DEBOUNCE_MS = 200;

@Component({
  selector: 'app-culinary-search-box',
  host: {
    class: 'relative z-20 block',
  },
  imports: [FormField, SyncIconComponent],
  templateUrl: './culinary-search-box.component.html',
  styleUrl: './culinary-search-box.component.css',
})
export class CulinarySearchBoxComponent {
  readonly destinations = input.required<CulinaryDestination[]>();
  readonly isLoading = input(false);

  readonly #locationModel = linkedSignal<CulinaryDestination[], CulinaryLocation>({
    source: this.destinations,
    computation: (destinations) => ({
      country: destinations[0]?.country ?? '',
      city: destinations[0]?.cities[0] ?? '',
    }),
  });

  readonly searchForm = form(this.#locationModel, (schema) => {
    required(schema.country);
    required(schema.city);
    debounce(schema.city, CITY_DEBOUNCE_MS);

    validate(schema.city, ({ value, valueOf }) => {
      const validCities = this.getCitiesForCountry(valueOf(schema.country));
      const isExists = validCities.some((city) => normalizeKeys(city) === normalizeKeys(value()));
      return isExists ? null : { kind: 'invalidCity', message: 'City is not in selected country' };
    });
  });

  readonly isDropdownOpen = signal(false);
  readonly activeOptionIndex = signal(NO_SELECTION_INDEX);

  readonly #lowercaseCity = computed(() => normalizeKeys(this.#locationModel().city));
  readonly isSearchDisabled = computed(() => this.searchForm().invalid() || this.isLoading());

  readonly filteredCities = computed(() => {
    const query = this.#lowercaseCity();
    const cities = this.getCitiesForCountry(this.#locationModel().country);
    return query ? cities.filter((city) => normalizeKeys(city).includes(query)) : cities;
  });

  readonly cityOptionId = computed(() =>
    this.activeOptionIndex() >= 0 ? `city-option-${this.activeOptionIndex()}` : null,
  );

  readonly cityOptions = viewChildren<ElementRef<HTMLElement>>('cityOption');

  readonly locationSelected = output<CulinaryLocation>();

  constructor() {
    afterRenderEffect(() => {
      const index = this.activeOptionIndex();
      if (this.isDropdownOpen() && index >= 0) {
        this.cityOptions()[index]?.nativeElement.scrollIntoView?.({
          block: 'nearest',
          inline: 'nearest',
        });
      }
    });
  }

  private getCitiesForCountry(countryName: string): readonly string[] {
    const countryData = this.destinations().find((item) => normalizeKeys(item.country) === normalizeKeys(countryName));
    return countryData?.cities || [];
  }

  onCountryChange(newCountryName: string): void {
    const firstCity = this.getCitiesForCountry(newCountryName)?.[0] || '';
    this.#locationModel.set({ country: newCountryName, city: firstCity });
    this.toggleDropdown(false);
  }

  toggleDropdown(isOpen: boolean, event?: Event): void {
    event?.preventDefault();
    this.isDropdownOpen.set(isOpen);
    if (!isOpen) {
      this.activeOptionIndex.set(NO_SELECTION_INDEX);
    }
  }

  selectCity(city: string, event?: Event): void {
    this.#locationModel.update((prev) => ({ ...prev, city }));
    this.toggleDropdown(false, event);
  }

  navigateOptions(direction: 'up' | 'down', event?: Event): void {
    const optionsCount = this.filteredCities().length;
    if (optionsCount <= 0) {
      return;
    }

    event?.preventDefault();

    if (!this.isDropdownOpen()) {
      this.isDropdownOpen.set(true);
      this.activeOptionIndex.set(direction === 'down' ? 0 : optionsCount - 1);
    } else {
      if (direction === 'down') {
        this.activeOptionIndex.update((curr) => (curr + 1) % optionsCount);
      } else {
        this.activeOptionIndex.update((curr) => (curr <= 0 ? optionsCount - 1 : curr - 1));
      }
    }
  }

  onEnter(event: Event): void {
    const index = this.activeOptionIndex();
    const options = this.filteredCities();
    if (this.isDropdownOpen() && index >= 0 && index < options.length) {
      event.preventDefault();
      const selected = options[index];
      if (selected) {
        this.selectCity(selected);
      }
    }
  }

  onSubmit(event?: Event): void {
    event?.preventDefault();
    if (this.searchForm().valid()) {
      this.isDropdownOpen.set(false);
      if (!this.isLoading()) {
        this.locationSelected.emit(this.#locationModel());
      }
    }
  }
}
