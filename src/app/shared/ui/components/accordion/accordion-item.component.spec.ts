import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ACCORDION_GROUP_CONTEXT } from './accordion-context.const';
import type { AccordionGroupContext } from './accordion-context.interface';
import { AccordionGroupComponent } from './accordion-group.component';
import { AccordionItemComponent } from './accordion-item.component';

describe('AccordionItemComponent', () => {
  describe('Unit / Isolated with Mock Context', () => {
    let component: AccordionItemComponent;
    let fixture: ComponentFixture<AccordionItemComponent>;
    let mockContext: AccordionGroupContext;

    beforeEach(async () => {
      mockContext = {
        isItemExpanded: vi.fn((id: string) => id === 'item-active'),
        toggleItem: vi.fn(),
      };

      await TestBed.configureTestingModule({
        imports: [AccordionItemComponent],
        providers: [provideZonelessChangeDetection(), { provide: ACCORDION_GROUP_CONTEXT, useValue: mockContext }],
      }).compileComponents();

      fixture = TestBed.createComponent(AccordionItemComponent);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      fixture.componentRef.setInput('id', 'item-1');
      expect(component).toBeTruthy();
    });

    it('computes isExpanded reactively from the context', async () => {
      fixture.componentRef.setInput('id', 'item-active');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.isExpanded()).toBe(true);
      expect(mockContext.isItemExpanded).toHaveBeenCalledWith('item-active');
    });

    it('computes isExpanded as false when context indicates item is not expanded', async () => {
      fixture.componentRef.setInput('id', 'item-inactive');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.isExpanded()).toBe(false);
      expect(mockContext.isItemExpanded).toHaveBeenCalledWith('item-inactive');
    });

    it('delegates toggle() to the group context toggleItem() with its id', () => {
      fixture.componentRef.setInput('id', 'item-42');
      component.toggle();

      expect(mockContext.toggleItem).toHaveBeenCalledWith('item-42');
    });

    it('binds accessibility and presentation attributes correctly', async () => {
      fixture.componentRef.setInput('id', 'test-item');
      fixture.detectChanges();
      await fixture.whenStable();

      const host = fixture.nativeElement as HTMLElement;
      const button = host.querySelector<HTMLButtonElement>('.accordion-trigger');
      const panel = host.querySelector<HTMLElement>('.accordion-panel');
      const chevron = host.querySelector<SVGElement>('.accordion-chevron');

      expect(button).toBeTruthy();
      expect(panel).toBeTruthy();
      expect(chevron).toBeTruthy();

      expect(button?.getAttribute('id')).toBe('accordion-header-test-item');
      expect(button?.getAttribute('aria-controls')).toBe('accordion-panel-test-item');
      expect(button?.getAttribute('aria-expanded')).toBe('false');

      expect(panel?.getAttribute('id')).toBe('accordion-panel-test-item');
      expect(panel?.getAttribute('role')).toBe('region');
      expect(panel?.getAttribute('aria-labelledby')).toBe('accordion-header-test-item');
      expect(panel?.hasAttribute('hidden')).toBe(true);
      expect(chevron?.classList.contains('rotate-180')).toBe(false);
    });

    it('updates aria-expanded, unhides panel, and rotates chevron when expanded', async () => {
      fixture.componentRef.setInput('id', 'item-active');
      fixture.detectChanges();
      await fixture.whenStable();

      const host = fixture.nativeElement as HTMLElement;
      const button = host.querySelector<HTMLButtonElement>('.accordion-trigger');
      const panel = host.querySelector<HTMLElement>('.accordion-panel');
      const chevron = host.querySelector<SVGElement>('.accordion-chevron');

      expect(button?.getAttribute('aria-expanded')).toBe('true');
      expect(panel?.hasAttribute('hidden')).toBe(false);
      expect(chevron?.classList.contains('rotate-180')).toBe(true);
    });

    it('triggers toggle() on trigger button click', async () => {
      fixture.componentRef.setInput('id', 'item-click');
      fixture.detectChanges();
      await fixture.whenStable();

      const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.accordion-trigger');
      button?.click();

      expect(mockContext.toggleItem).toHaveBeenCalledWith('item-click');
    });

    it('emits expandedChange with the updated expansion state when toggled', async () => {
      const isItemExpandedSignal = signal(false);
      mockContext.isItemExpanded = vi.fn(() => isItemExpandedSignal());
      mockContext.toggleItem = vi.fn(() => {
        isItemExpandedSignal.update((v) => !v);
      });

      fixture.componentRef.setInput('id', 'item-toggle-emit');
      fixture.detectChanges();
      await fixture.whenStable();

      const emittedValues: boolean[] = [];
      component.expandedChange.subscribe((val) => emittedValues.push(val));

      const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.accordion-trigger');

      // First click: expands
      button?.click();
      fixture.detectChanges();
      await fixture.whenStable();

      // Second click: collapses
      button?.click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(emittedValues).toEqual([true, false]);
    });

    it('disables trigger button and prevents toggling when isDisabled is true', async () => {
      fixture.componentRef.setInput('id', 'item-disabled');
      fixture.componentRef.setInput('isDisabled', true);
      fixture.detectChanges();
      await fixture.whenStable();

      const emittedValues: boolean[] = [];
      component.expandedChange.subscribe((val) => emittedValues.push(val));

      const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.accordion-trigger');
      expect(button?.disabled).toBe(true);
      expect(button?.getAttribute('aria-disabled')).toBe('true');

      button?.click();
      component.toggle();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockContext.toggleItem).not.toHaveBeenCalled();
      expect(emittedValues).toEqual([]);
      expect(button?.getAttribute('aria-expanded')).toBe('false');
    });

    it('scrolls the trigger button into view when expanded and does not scroll when collapsed', async () => {
      const isItemExpandedSignal = signal(false);
      mockContext.isItemExpanded = vi.fn(() => isItemExpandedSignal());
      mockContext.toggleItem = vi.fn(() => {
        isItemExpandedSignal.update((v) => !v);
      });

      fixture.componentRef.setInput('id', 'item-scroll');
      fixture.detectChanges();
      await fixture.whenStable();

      const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.accordion-trigger');
      expect(button).toBeTruthy();

      const scrollIntoViewSpy = vi.fn();
      if (button) {
        button.scrollIntoView = scrollIntoViewSpy;
      }

      // 1. Expand item -> should scroll trigger button into view
      button?.click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(scrollIntoViewSpy).toHaveBeenCalledTimes(1);
      expect(scrollIntoViewSpy).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'nearest',
      });

      // 2. Collapse item -> should not trigger additional scrollIntoView
      scrollIntoViewSpy.mockClear();
      button?.click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(scrollIntoViewSpy).not.toHaveBeenCalled();
    });
  });

  describe('Compound Integration with AccordionGroupComponent', () => {
    @Component({
      imports: [AccordionGroupComponent, AccordionItemComponent],
      template: `
        <app-accordion-group [isMulti]="isMulti">
          <app-accordion-item id="dish-1">
            <div accordion-header class="header-dish-1">Dish 1 Header</div>
            <div accordion-body class="body-dish-1">Dish 1 Body</div>
          </app-accordion-item>
          <app-accordion-item id="dish-2">
            <div accordion-header class="header-dish-2">Dish 2 Header</div>
            <div accordion-body class="body-dish-2">Dish 2 Body</div>
          </app-accordion-item>
        </app-accordion-group>
      `,
    })
    class CompoundHostComponent {
      isMulti = false;
    }

    let hostFixture: ComponentFixture<CompoundHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [CompoundHostComponent],
        providers: [provideZonelessChangeDetection()],
      }).compileComponents();

      hostFixture = TestBed.createComponent(CompoundHostComponent);
      hostFixture.detectChanges();
      await hostFixture.whenStable();
    });

    it('projects header and body slots into the correct containers', () => {
      const compiled = hostFixture.nativeElement as HTMLElement;
      const header1 = compiled.querySelector('.header-dish-1');
      const body1 = compiled.querySelector('.body-dish-1');

      expect(header1).toBeTruthy();
      expect(body1).toBeTruthy();
      expect(header1?.textContent).toContain('Dish 1 Header');
      expect(body1?.textContent).toContain('Dish 1 Body');
    });

    it('initializes all panels in collapsed state', () => {
      const compiled = hostFixture.nativeElement as HTMLElement;
      const panels = compiled.querySelectorAll<HTMLElement>('.accordion-panel');

      expect(panels[0]?.hasAttribute('hidden')).toBe(true);
      expect(panels[1]?.hasAttribute('hidden')).toBe(true);
    });

    it('expands first panel and updates attributes when trigger clicked', async () => {
      const compiled = hostFixture.nativeElement as HTMLElement;
      const triggers = compiled.querySelectorAll<HTMLButtonElement>('.accordion-trigger');
      const panels = compiled.querySelectorAll<HTMLElement>('.accordion-panel');

      triggers[0]?.click();
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      expect(panels[0]?.hasAttribute('hidden')).toBe(false);
      expect(panels[1]?.hasAttribute('hidden')).toBe(true);
      expect(triggers[0]?.getAttribute('aria-expanded')).toBe('true');
      expect(triggers[1]?.getAttribute('aria-expanded')).toBe('false');
    });

    it('collapses previous panel when another item is expanded in single mode', async () => {
      const compiled = hostFixture.nativeElement as HTMLElement;
      const triggers = compiled.querySelectorAll<HTMLButtonElement>('.accordion-trigger');
      const panels = compiled.querySelectorAll<HTMLElement>('.accordion-panel');

      triggers[0]?.click();
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      triggers[1]?.click();
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      expect(panels[0]?.hasAttribute('hidden')).toBe(true);
      expect(panels[1]?.hasAttribute('hidden')).toBe(false);
      expect(triggers[0]?.getAttribute('aria-expanded')).toBe('false');
      expect(triggers[1]?.getAttribute('aria-expanded')).toBe('true');
    });

    it('scrolls the newly expanded item trigger into view without scrolling the collapsed sibling trigger', async () => {
      const compiled = hostFixture.nativeElement as HTMLElement;
      const triggers = compiled.querySelectorAll<HTMLButtonElement>('.accordion-trigger');
      const scrollSpy1 = vi.fn();
      const scrollSpy2 = vi.fn();

      if (triggers[0]) {
        triggers[0].scrollIntoView = scrollSpy1;
      }
      if (triggers[1]) {
        triggers[1].scrollIntoView = scrollSpy2;
      }

      // 1. Expand Dish 1 -> Dish 1 trigger scrolls into view
      triggers[0]?.click();
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      expect(scrollSpy1).toHaveBeenCalledTimes(1);
      expect(scrollSpy1).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'nearest',
      });
      expect(scrollSpy2).not.toHaveBeenCalled();

      // 2. Expand Dish 2 -> Dish 1 collapses (no scroll), Dish 2 expands and scrolls into view
      scrollSpy1.mockClear();
      triggers[1]?.click();
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      expect(scrollSpy1).not.toHaveBeenCalled();
      expect(scrollSpy2).toHaveBeenCalledTimes(1);
      expect(scrollSpy2).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'nearest',
      });
    });
  });
});
