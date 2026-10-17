import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonComponent } from './skeleton.component';

describe('SkeletonComponent', () => {
  let fixture: ComponentFixture<SkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonComponent);
  });

  function getItems(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.skeleton-primitive'));
  }

  describe('Default State', () => {
    it('should render a single line skeleton with aria-hidden="true"', () => {
      fixture.detectChanges();

      const items = getItems();
      expect(items.length).toBe(1);
      expect(items[0].getAttribute('aria-hidden')).toBe('true');
      expect(items[0].classList.contains('skeleton-primitive')).toBe(true);
      expect(items[0].classList.contains('skeleton-line')).toBe(true);
    });
  });

  describe('Variant Configuration', () => {
    it('should render circle variant class when variant="circle"', () => {
      fixture.componentRef.setInput('variant', 'circle');
      fixture.detectChanges();

      const items = getItems();
      expect(items.length).toBe(1);
      expect(items[0].classList.contains('skeleton-circle')).toBe(true);
      expect(items[0].classList.contains('skeleton-line')).toBe(false);
    });

    it('should render rect variant class when variant="rect"', () => {
      fixture.componentRef.setInput('variant', 'rect');
      fixture.detectChanges();

      const items = getItems();
      expect(items.length).toBe(1);
      expect(items[0].classList.contains('skeleton-rect')).toBe(true);
      expect(items[0].classList.contains('skeleton-line')).toBe(false);
    });
  });

  describe('Class Input Merging', () => {
    it('should merge custom classes passed via class input', () => {
      fixture.componentRef.setInput('class', 'h-10 w-10 shrink-0');
      fixture.detectChanges();

      const items = getItems();
      expect(items[0].classList.contains('skeleton-primitive')).toBe(true);
      expect(items[0].classList.contains('h-10')).toBe(true);
      expect(items[0].classList.contains('w-10')).toBe(true);
      expect(items[0].classList.contains('shrink-0')).toBe(true);
    });
  });

  describe('Multi-line Rendering', () => {
    it('should render multiple items with the last item indented (w-3/4) for line variant', () => {
      fixture.componentRef.setInput('lines', 3);
      fixture.detectChanges();

      const items = getItems();
      expect(items.length).toBe(3);
      expect(items[0].classList.contains('w-3/4')).toBe(false);
      expect(items[1].classList.contains('w-3/4')).toBe(false);
      expect(items[2].classList.contains('w-3/4')).toBe(true);
    });

    it('should not add w-3/4 when lines=1 for line variant', () => {
      fixture.componentRef.setInput('lines', 1);
      fixture.detectChanges();

      const items = getItems();
      expect(items.length).toBe(1);
      expect(items[0].classList.contains('w-3/4')).toBe(false);
    });

    it('should fallback to 1 item when lines <= 0', () => {
      fixture.componentRef.setInput('lines', 0);
      fixture.detectChanges();

      const items = getItems();
      expect(items.length).toBe(1);
    });

    it('should not add w-3/4 to the last item when variant is not line', () => {
      fixture.componentRef.setInput('variant', 'rect');
      fixture.componentRef.setInput('lines', 2);
      fixture.detectChanges();

      const items = getItems();
      expect(items.length).toBe(2);
      expect(items[0].classList.contains('w-3/4')).toBe(false);
      expect(items[1].classList.contains('w-3/4')).toBe(false);
    });
  });
});
