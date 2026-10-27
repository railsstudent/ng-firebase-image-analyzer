import type { CulinaryDestination } from '@/core/culinary-guide';
import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
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

  it('should handle keyboard navigation (ArrowDown, ArrowUp, Enter, Escape) and scroll active option into view', async () => {
    // Clear city query so all 3 cities are available for navigation
    component.selectCity('');
    component.toggleDropdown(true);
    await fixture.whenStable();

    const options = fixture.nativeElement.querySelectorAll('li[role="option"]') as NodeListOf<HTMLElement>;
    const scrollSpies = Array.from(options).map((el) => {
      el.scrollIntoView = vi.fn();
      return el.scrollIntoView;
    });

    // ArrowDown should preventDefault, move active index down, and scroll option into view
    const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true });
    const preventDefaultSpy = vi.spyOn(downEvent, 'preventDefault');
    component.navigateOptions('down', downEvent);
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(component.activeOptionIndex()).toBe(0);
    await fixture.whenStable();
    expect(scrollSpies[0]).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });

    component.navigateOptions('down');
    expect(component.activeOptionIndex()).toBe(1);
    await fixture.whenStable();
    expect(scrollSpies[1]).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });

    // ArrowUp should move active index up and scroll option into view
    component.navigateOptions('up');
    expect(component.activeOptionIndex()).toBe(0);
    await fixture.whenStable();
    expect(scrollSpies[0]).toHaveBeenCalledTimes(2);

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

  describe('Loading State & Spinner (Ticket 24)', () => {
    it('should disable submit button when isLoading is true even if form is valid', async () => {
      fixture.componentRef.setInput('isLoading', true);
      await fixture.whenStable();

      const button = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(button.disabled).toBe(true);
      expect(button.getAttribute('aria-disabled')).toBe('true');
    });

    it('should render spinner icon inside submit button when isLoading is true and omit it when false', async () => {
      fixture.componentRef.setInput('isLoading', false);
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('app-sync-icon')).toBeNull();

      fixture.componentRef.setInput('isLoading', true);
      await fixture.whenStable();

      const spinner = fixture.nativeElement.querySelector('button[type="submit"] app-sync-icon');
      expect(spinner).not.toBeNull();
    });

    it('should prevent form submission and not emit locationSelected when isLoading is true', async () => {
      const emitSpy = vi.fn();
      component.locationSelected.subscribe(emitSpy);

      fixture.componentRef.setInput('isLoading', true);
      await fixture.whenStable();

      component.onSubmit();
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });
});
