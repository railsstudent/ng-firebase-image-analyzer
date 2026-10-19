import type { CulinaryLocation, DestinationDataset } from '@/core/culinary-guide';
import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

const NO_SELECTION_INDEX = -1;
const BLUR_CLOSE_DELAY_MS = 200;

@Component({
  selector: 'app-culinary-search-box',
  imports: [FormField],
  templateUrl: './culinary-search-box.component.html',
  styleUrl: './culinary-search-box.component.css',
})
export class CulinarySearchBoxComponent {
  readonly dataset = input.required<DestinationDataset>();

  readonly locationModel = linkedSignal<DestinationDataset, CulinaryLocation>({
    source: this.dataset,
    computation: (dataset) => {
      const firstCountry = dataset.data[0]?.country ?? '';
      const firstCity = dataset.data[0]?.cities[0] ?? '';
      return { country: firstCountry, city: firstCity };
    },
  });
  readonly searchForm = form(this.locationModel);

  readonly filterQuery = signal<string>('');
  readonly isDropdownOpen = signal<boolean>(false);
  readonly activeOptionIndex = signal<number>(NO_SELECTION_INDEX);

  readonly currentCountryCities = computed<string[]>(() => {
    const activeCountry = this.locationModel().country;
    return this.dataset().data.find((item) => item.country === activeCountry)?.cities ?? [];
  });

  readonly filteredCities = computed<string[]>(() => {
    const query = this.filterQuery().toLowerCase().trim();
    const cities = this.currentCountryCities();
    if (!query) {
      return cities;
    }
    return cities.filter((city) => city.toLowerCase().includes(query));
  });

  readonly isValidSelection = computed(() => {
    const selectedCountry = this.locationModel().country;
    const countryMatch = this.dataset().data.find((item) => item.country === selectedCountry);
    if (!countryMatch) {
      return false;
    }
    const currentCity = this.locationModel().city.trim().toLowerCase();
    return countryMatch.cities.some((city) => city.toLowerCase() === currentCity);
  });

  readonly locationSelected = output<CulinaryLocation>();

  onCountryChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newCountryName = select.value;
    const countryData = this.dataset().data.find((item) => item.country === newCountryName);
    const firstCity = countryData?.cities[0] ?? '';

    this.locationModel.set({ country: newCountryName, city: firstCity });
    this.filterQuery.set('');
    this.isDropdownOpen.set(false);
    this.activeOptionIndex.set(NO_SELECTION_INDEX);
  }

  onCityInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const value = inputEl.value;
    this.locationModel.update((prev) => ({ ...prev, city: value }));
    this.filterQuery.set(value);
    this.isDropdownOpen.set(true);
    this.activeOptionIndex.set(NO_SELECTION_INDEX);
  }

  onCityFocus(): void {
    this.isDropdownOpen.set(true);
  }

  onCityBlur(): void {
    setTimeout(() => {
      this.isDropdownOpen.set(false);
      this.activeOptionIndex.set(NO_SELECTION_INDEX);
    }, BLUR_CLOSE_DELAY_MS);
  }

  selectCity(city: string): void {
    this.locationModel.update((prev) => ({ ...prev, city }));
    this.filterQuery.set('');
    this.isDropdownOpen.set(false);
    this.activeOptionIndex.set(NO_SELECTION_INDEX);
  }

  private handleArrowNav(direction: 'up' | 'down', optionsCount: number): void {
    if (!this.isDropdownOpen()) {
      this.isDropdownOpen.set(true);
      this.activeOptionIndex.set(direction === 'down' ? 0 : optionsCount - 1);
      return;
    }
    if (direction === 'down') {
      this.activeOptionIndex.update((curr) => (curr + 1) % optionsCount);
    } else {
      this.activeOptionIndex.update((curr) => (curr <= 0 ? optionsCount - 1 : curr - 1));
    }
  }

  private handleEnter(options: readonly string[]): void {
    const index = this.activeOptionIndex();
    if (this.isDropdownOpen() && index >= 0 && index < options.length) {
      const selected = options[index];
      if (selected) {
        this.selectCity(selected);
      }
    }
  }

  onKeydown(event: KeyboardEvent): void {
    const options = this.filteredCities();
    if (options.length === 0) {
      if (event.key === 'Escape') {
        this.isDropdownOpen.set(false);
      }
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.handleArrowNav(event.key === 'ArrowDown' ? 'down' : 'up', options.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.handleEnter(options);
    } else if (event.key === 'Escape' || event.key === 'Tab') {
      if (event.key === 'Escape') {
        event.preventDefault();
      }
      this.isDropdownOpen.set(false);
      this.activeOptionIndex.set(NO_SELECTION_INDEX);
    }
  }

  onSubmit(event?: Event): void {
    event?.preventDefault();
    if (!this.isValidSelection()) {
      return;
    }
    this.isDropdownOpen.set(false);
    this.locationSelected.emit({
      country: this.locationModel().country,
      city: this.locationModel().city,
    });
  }
}
