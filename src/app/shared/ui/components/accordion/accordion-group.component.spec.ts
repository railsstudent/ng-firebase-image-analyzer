import { Component, provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { AccordionGroupComponent } from './accordion-group.component';

describe('AccordionGroupComponent', () => {
  let component: AccordionGroupComponent;
  let fixture: ComponentFixture<AccordionGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccordionGroupComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AccordionGroupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initializes with an empty expandedIds list by default', () => {
    expect(component.expandedIds()).toEqual([]);
    expect(component.isItemExpanded('item-1')).toBe(false);
  });

  describe('single-expansion mode (default, isMulti = false)', () => {
    it('expands an item and collapses previously expanded items', () => {
      component.toggleItem('item-1');
      expect(component.expandedIds()).toEqual(['item-1']);
      expect(component.isItemExpanded('item-1')).toBe(true);

      component.toggleItem('item-2');
      expect(component.expandedIds()).toEqual(['item-2']);
      expect(component.isItemExpanded('item-1')).toBe(false);
      expect(component.isItemExpanded('item-2')).toBe(true);
    });

    it('collapses an already open item when toggled again', () => {
      component.toggleItem('item-1');
      expect(component.isItemExpanded('item-1')).toBe(true);

      component.toggleItem('item-1');
      expect(component.expandedIds()).toEqual([]);
      expect(component.isItemExpanded('item-1')).toBe(false);
    });
  });

  describe('multi-expansion mode (isMulti = true)', () => {
    beforeEach(async () => {
      fixture.componentRef.setInput('isMulti', true);
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('allows multiple items to be expanded simultaneously', () => {
      component.toggleItem('item-1');
      component.toggleItem('item-2');

      expect(component.expandedIds()).toEqual(['item-1', 'item-2']);
      expect(component.isItemExpanded('item-1')).toBe(true);
      expect(component.isItemExpanded('item-2')).toBe(true);
    });

    it('collapses only the toggled item, preserving other expanded items', () => {
      component.toggleItem('item-1');
      component.toggleItem('item-2');
      component.toggleItem('item-3');

      component.toggleItem('item-2');
      expect(component.expandedIds()).toEqual(['item-1', 'item-3']);
      expect(component.isItemExpanded('item-2')).toBe(false);
      expect(component.isItemExpanded('item-1')).toBe(true);
      expect(component.isItemExpanded('item-3')).toBe(true);
    });
  });

  describe('programmatic collapseAll', () => {
    it('resets all expanded items to empty', async () => {
      fixture.componentRef.setInput('isMulti', true);
      fixture.detectChanges();
      await fixture.whenStable();

      component.toggleItem('item-1');
      component.toggleItem('item-2');
      expect(component.expandedIds().length).toBe(2);

      component.collapseAll();
      expect(component.expandedIds()).toEqual([]);
      expect(component.isItemExpanded('item-1')).toBe(false);
      expect(component.isItemExpanded('item-2')).toBe(false);
    });

    it('reactively updates when expandedIds model is set directly', () => {
      component.expandedIds.set(['item-99']);
      expect(component.isItemExpanded('item-99')).toBe(true);

      component.expandedIds.set([]);
      expect(component.isItemExpanded('item-99')).toBe(false);
    });
  });

  describe('AccordionGroupComponent template projection', () => {
    @Component({
      imports: [AccordionGroupComponent],
      template: `
        <app-accordion-group>
          <div class="test-projected-child">Projected Child</div>
        </app-accordion-group>
      `,
    })
    class TestHostComponent {}

    it('projects unslotted content into the container', async () => {
      const hostFixture = TestBed.createComponent(TestHostComponent);
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      const projectedEl = hostFixture.nativeElement.querySelector('.test-projected-child');
      expect(projectedEl).toBeTruthy();
      expect(projectedEl?.textContent).toBe('Projected Child');
    });
  });
});
