import type { DestinationDataset } from '@/core/culinary-guide';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CulinarySearchBoxComponent } from './culinary-search-box.component';

const MOCK_DATASET: DestinationDataset = {
  data: [
    { country: 'Japan', cities: ['Tokyo', 'Osaka', 'Kyoto'] },
    { country: 'Italy', cities: ['Rome', 'Florence', 'Naples'] },
  ],
};

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
    fixture.componentRef.setInput('dataset', MOCK_DATASET);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize country and city from the first entry of dataset', () => {
    expect(component.locationModel()).toEqual({
      country: 'Japan',
      city: 'Tokyo',
    });
    expect(component.isValidSelection()).toBe(true);
  });

  it('should cascade and reset city to first city of newly selected country', () => {
    const event = {
      target: { value: 'Italy' },
    } as unknown as Event;

    component.onCountryChange(event);

    expect(component.locationModel()).toEqual({
      country: 'Italy',
      city: 'Rome',
    });
    expect(component.isValidSelection()).toBe(true);
  });

  it('should filter matching cities based on input in real-time', () => {
    component.onCityFocus();
    expect(component.isDropdownOpen()).toBe(true);
    expect(component.filteredCities()).toEqual(['Tokyo', 'Osaka', 'Kyoto']);

    component.onCityInput({
      target: { value: 'kyo' },
    } as unknown as Event);

    expect(component.filteredCities()).toEqual(['Tokyo', 'Kyoto']);
    expect(component.locationModel().city).toBe('kyo');
    expect(component.isValidSelection()).toBe(false);
  });

  it('should select city and update locationModel when selectCity is invoked', () => {
    component.selectCity('Osaka');

    expect(component.locationModel().city).toBe('Osaka');
    expect(component.isValidSelection()).toBe(true);
    expect(component.isDropdownOpen()).toBe(false);
  });

  it('should handle keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)', () => {
    component.isDropdownOpen.set(true);

    // ArrowDown should move active index down
    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(component.activeOptionIndex()).toBe(0);

    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(component.activeOptionIndex()).toBe(1);

    // ArrowUp should move active index up
    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(component.activeOptionIndex()).toBe(0);

    // Enter should select active option
    component.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(component.locationModel().city).toBe('Tokyo');
    expect(component.isDropdownOpen()).toBe(false);

    // Escape should close dropdown
    component.isDropdownOpen.set(true);
    component.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(component.isDropdownOpen()).toBe(false);
  });

  it('should disable submit when selection is invalid and not emit', () => {
    const emitSpy = vi.fn();
    component.locationSelected.subscribe(emitSpy);

    component.locationModel.set({ country: 'Japan', city: 'UnknownCity' });
    expect(component.isValidSelection()).toBe(false);

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
