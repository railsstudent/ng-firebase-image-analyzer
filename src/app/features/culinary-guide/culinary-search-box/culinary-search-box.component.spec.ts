import type { CulinaryDestination } from '@/core/culinary-guide';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { CulinarySearchBoxComponent } from './culinary-search-box.component';

const MOCK_DESTINATIONS: readonly CulinaryDestination[] = [
  { country: 'Japan', cities: ['Tokyo', 'Osaka', 'Kyoto'] },
  { country: 'Italy', cities: ['Rome', 'Florence', 'Naples'] },
];

describe('CulinarySearchBoxComponent', () => {
  let component: CulinarySearchBoxComponent;
  let fixture: ComponentFixture<CulinarySearchBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CulinarySearchBoxComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(CulinarySearchBoxComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('destinations', MOCK_DESTINATIONS);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize country and city from the first entry of destinations', () => {
    expect(component.searchForm().value()).toEqual({
      country: 'Japan',
      city: 'Tokyo',
    });
    expect(component.searchForm().valid()).toBe(true);
  });

  it('should cascade and reset city to first city of newly selected country', () => {
    component.onCountryChange('Italy');

    expect(component.searchForm().value()).toEqual({
      country: 'Italy',
      city: 'Rome',
    });
    expect(component.searchForm().valid()).toBe(true);
  });

  it('should filter matching cities based on selection and query', () => {
    component.toggleDropdown(true);
    expect(component.isDropdownOpen()).toBe(true);
    // Initial city is 'Tokyo', so filter matches 'Tokyo'
    expect(component.filteredCities()).toEqual(['Tokyo']);

    // Clear city query to see all cities in Japan
    component.selectCity('');
    expect(component.filteredCities()).toEqual(['Tokyo', 'Osaka', 'Kyoto']);

    // Filter by partial query 'kyo'
    component.selectCity('kyo');
    expect(component.filteredCities()).toEqual(['Tokyo', 'Kyoto']);

    // Select exact city
    component.selectCity('Kyoto');
    expect(component.filteredCities()).toEqual(['Kyoto']);
    expect(component.searchForm().value().city).toBe('Kyoto');
    expect(component.searchForm().valid()).toBe(true);
  });

  it('should select city and update locationModel when selectCity is invoked', () => {
    component.selectCity('Osaka');

    expect(component.searchForm().value().city).toBe('Osaka');
    expect(component.searchForm().valid()).toBe(true);
    expect(component.isDropdownOpen()).toBe(false);
  });

  it('should handle keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)', () => {
    // Clear city query so all 3 cities are available for navigation
    component.selectCity('');
    component.toggleDropdown(true);

    // ArrowDown should move active index down
    component.navigateOptions('down');
    expect(component.activeOptionIndex()).toBe(0);

    component.navigateOptions('down');
    expect(component.activeOptionIndex()).toBe(1);

    // ArrowUp should move active index up
    component.navigateOptions('up');
    expect(component.activeOptionIndex()).toBe(0);

    // Enter should select active option
    component.onEnter(new Event('keydown'));
    expect(component.searchForm().value().city).toBe('Tokyo');
    expect(component.isDropdownOpen()).toBe(false);

    // Escape/toggle should close dropdown
    component.toggleDropdown(true);
    component.toggleDropdown(false);
    expect(component.isDropdownOpen()).toBe(false);
  });

  it('should disable submit when selection is invalid and not emit', () => {
    const emitSpy = vi.fn();
    component.locationSelected.subscribe(emitSpy);

    component.selectCity('UnknownCity');
    expect(component.searchForm().invalid()).toBe(true);

    component.onSubmit();
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit locationSelected output with valid location payload upon submission', () => {
    const emitSpy = vi.fn();
    component.locationSelected.subscribe(emitSpy);

    component.onSubmit();

    expect(emitSpy).toHaveBeenCalledWith({
      country: 'Japan',
      city: 'Tokyo',
    });
  });
});
