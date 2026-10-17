import { Component, provideZonelessChangeDetection } from '@angular/core';
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
  });
});
