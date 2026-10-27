import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import type { CulinaryFoodItem } from '@/core/culinary-guide/culinary-guide.interface';
import type { CulinaryRecipeDetail } from '@/features/culinary-guide/interfaces/culinary-recipe-detail.interface';
import { AccordionItemComponent } from '@/shared/ui/components/accordion/accordion-item.component';
import { CulinaryDishListComponent } from './culinary-dish-list.component';

const MOCK_DISHES: CulinaryFoodItem[] = [
  {
    name: 'Ramen',
    nativeName: 'ラーメン',
    description: 'Savory noodle soup with rich pork or chicken broth and toppings.',
  },
  {
    name: 'Sushi',
    nativeName: undefined,
    description: 'Vinegared rice topped with fresh seasonal fish.',
  },
];

@Component({
  imports: [CulinaryDishListComponent],
  template: `
    <app-culinary-dish-list
      [dishes]="dishes()"
      [(expandedDishNames)]="expandedDishNames"
      [recipes]="recipes()"
      [isMulti]="isMulti()"
      [isDisabled]="isDisabled()"
      (dishSelected)="onDishSelected($event)"
    />
  `,
})
class TestHostComponent {
  dishes = signal<CulinaryFoodItem[]>(MOCK_DISHES);
  expandedDishNames = signal<string[]>([]);
  recipes = signal<Record<string, CulinaryRecipeDetail>>({});
  isMulti = signal(true);
  isDisabled = signal(false);
  selectedDishes: CulinaryFoodItem[] = [];

  onDishSelected(dish: CulinaryFoodItem): void {
    this.selectedDishes.push(dish);
  }
}

describe('CulinaryDishListComponent - Slice 1: Header & Native Badges', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, CulinaryDishListComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create the host and component', () => {
    const listEl = fixture.nativeElement.querySelector('app-culinary-dish-list');
    expect(listEl).toBeTruthy();
    expect(hostComponent).toBeTruthy();
  });

  it('should render a list of accordion items matching the dishes input', () => {
    const accordionItems = fixture.nativeElement.querySelectorAll('app-accordion-item');
    expect(accordionItems.length).toBe(2);
    expect(fixture.nativeElement.querySelector('.empty-state-text')).toBeNull();
  });

  it('should render empty state card and omit accordion group when dishes input is empty', async () => {
    hostComponent.dishes.set([]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('app-accordion-group')).toBeNull();
    const emptyCard = fixture.nativeElement.querySelector('.section-card .empty-state-text');
    expect(emptyCard).toBeTruthy();
    expect(emptyCard?.textContent?.trim()).toBe(
      'No iconic dishes available. Search for a destination above to explore local culinary highlights.',
    );
  });

  it('should render English dish names and descriptions for all dishes', () => {
    const accordionItems = fixture.nativeElement.querySelectorAll('app-accordion-item');
    const ramenHeader = accordionItems[0].querySelector('[accordion-header]');
    const sushiHeader = accordionItems[1].querySelector('[accordion-header]');

    expect(ramenHeader?.textContent).toContain('Ramen');
    expect(ramenHeader?.textContent).toContain('Savory noodle soup with rich pork or chicken broth and toppings.');

    expect(sushiHeader?.textContent).toContain('Sushi');
    expect(sushiHeader?.textContent).toContain('Vinegared rice topped with fresh seasonal fish.');
  });

  it('should render semantic header classes and structure', () => {
    const accordionItems = fixture.nativeElement.querySelectorAll('app-accordion-item');
    const headerEl = accordionItems[0].querySelector('[accordion-header]');
    expect(headerEl.classList).toContain('dish-header');
    expect(headerEl.querySelector('.dish-title-row')).toBeTruthy();
    expect(headerEl.querySelector('.text-on-surface')?.textContent).toBe('Ramen');
    expect(headerEl.querySelector('.dish-description')?.textContent).toContain(
      'Savory noodle soup with rich pork or chicken broth and toppings.',
    );
  });

  it('should render native script pill badge only when nativeName is defined and non-empty after trimming', async () => {
    hostComponent.dishes.set([
      { name: 'Ramen', nativeName: 'ラーメン', description: 'Ramen desc' },
      { name: 'Sushi', nativeName: undefined, description: 'Sushi desc' },
      { name: 'Tempura', nativeName: '   ', description: 'Tempura desc' },
      { name: 'Udon', nativeName: '', description: 'Udon desc' },
    ]);
    await fixture.whenStable();

    const accordionItems = fixture.nativeElement.querySelectorAll('app-accordion-item');
    const ramenBadge = accordionItems[0].querySelector('.dish-native-badge');
    const sushiBadge = accordionItems[1].querySelector('.dish-native-badge');
    const tempuraBadge = accordionItems[2].querySelector('.dish-native-badge');
    const udonBadge = accordionItems[3].querySelector('.dish-native-badge');

    expect(ramenBadge).toBeTruthy();
    expect(ramenBadge?.textContent?.trim()).toBe('ラーメン');
    expect(sushiBadge).toBeNull();
    expect(tempuraBadge).toBeNull();
    expect(udonBadge).toBeNull();
  });
});

describe('CulinaryDishListComponent - Slice 2: Expansion & dishSelected Output', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, CulinaryDishListComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should emit dishSelected with the full CulinaryFoodItem when an item is expanded', async () => {
    const triggerButtons = fixture.nativeElement.querySelectorAll('button.accordion-trigger');
    expect(triggerButtons.length).toBe(2);

    triggerButtons[0].click();
    await fixture.whenStable();

    expect(hostComponent.selectedDishes.length).toBe(1);
    expect(hostComponent.selectedDishes[0]).toEqual(MOCK_DISHES[0]);
    expect(hostComponent.expandedDishNames()).toEqual(['Ramen']);
  });

  it('should not emit dishSelected when an expanded item is collapsed', async () => {
    const triggerButtons = fixture.nativeElement.querySelectorAll('button.accordion-trigger');

    // Expand Ramen
    triggerButtons[0].click();
    await fixture.whenStable();
    expect(hostComponent.selectedDishes.length).toBe(1);

    // Collapse Ramen
    triggerButtons[0].click();
    await fixture.whenStable();
    expect(hostComponent.selectedDishes.length).toBe(1);
    expect(hostComponent.expandedDishNames()).toEqual([]);
  });

  it('should support multi-expansion when isMulti is true', async () => {
    const triggerButtons = fixture.nativeElement.querySelectorAll('button.accordion-trigger');

    triggerButtons[0].click();
    await fixture.whenStable();

    triggerButtons[1].click();
    await fixture.whenStable();

    expect(hostComponent.selectedDishes.length).toBe(2);
    expect(hostComponent.selectedDishes[1]).toEqual(MOCK_DISHES[1]);
    expect(hostComponent.expandedDishNames()).toEqual(['Ramen', 'Sushi']);
  });

  it('should support single-expansion when isMulti is false', async () => {
    hostComponent.isMulti.set(false);
    await fixture.whenStable();

    const triggerButtons = fixture.nativeElement.querySelectorAll('button.accordion-trigger');

    // Expand Ramen
    triggerButtons[0].click();
    await fixture.whenStable();
    expect(hostComponent.expandedDishNames()).toEqual(['Ramen']);

    // Expand Sushi
    triggerButtons[1].click();
    await fixture.whenStable();
    expect(hostComponent.expandedDishNames()).toEqual(['Sushi']);
    expect(hostComponent.selectedDishes.length).toBe(2);
  });

  it('should collapse all items when expandedDishNames is set to empty array programmatically', async () => {
    const triggerButtons = fixture.nativeElement.querySelectorAll('button.accordion-trigger');

    triggerButtons[0].click();
    await fixture.whenStable();
    expect(hostComponent.expandedDishNames()).toEqual(['Ramen']);

    // Programmatically collapse
    hostComponent.expandedDishNames.set([]);
    await fixture.whenStable();

    const panels = fixture.nativeElement.querySelectorAll('div[role="region"]');
    expect(panels[0].getAttribute('hidden')).not.toBeNull();
    expect(panels[1].getAttribute('hidden')).not.toBeNull();
  });

  it('should emit dishSelected when an accordion item emits expandedChange with true', () => {
    const dishListDebugEl = fixture.debugElement.query(By.directive(CulinaryDishListComponent));
    const accordionItemDebugEls = dishListDebugEl.queryAll(By.directive(AccordionItemComponent));
    expect(accordionItemDebugEls.length).toBe(2);

    accordionItemDebugEls[0].triggerEventHandler('expandedChange', true);

    expect(hostComponent.selectedDishes.length).toBe(1);
    expect(hostComponent.selectedDishes[0]).toEqual(MOCK_DISHES[0]);
  });

  it('should not emit dishSelected when an accordion item emits expandedChange with false', () => {
    const dishListDebugEl = fixture.debugElement.query(By.directive(CulinaryDishListComponent));
    const accordionItemDebugEls = dishListDebugEl.queryAll(By.directive(AccordionItemComponent));

    accordionItemDebugEls[0].triggerEventHandler('expandedChange', false);

    expect(hostComponent.selectedDishes.length).toBe(0);
  });

  it('should not emit dishSelected when clicking inside the accordion dish body', async () => {
    const triggerButtons = fixture.nativeElement.querySelectorAll('button.accordion-trigger');
    triggerButtons[0].click();
    await fixture.whenStable();
    expect(hostComponent.selectedDishes.length).toBe(1);

    const dishBody = fixture.nativeElement.querySelector('.dish-body') as HTMLElement;
    expect(dishBody).toBeTruthy();

    dishBody.click();
    await fixture.whenStable();

    expect(hostComponent.selectedDishes.length).toBe(1);
  });
});

describe('CulinaryDishListComponent - Slice 3: Recipe Body Skeletons & Responsive Layout', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, CulinaryDishListComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.expandedDishNames.set(['Ramen']);
    await fixture.whenStable();
  });

  it('should render responsive layout and scroll containment classes on accordion body', () => {
    const ramenBody = fixture.nativeElement.querySelector('[accordion-body]');
    expect(ramenBody.classList).toContain('dish-body');
    const contentGrid = ramenBody.querySelector('.dish-content-grid');
    expect(contentGrid).toBeTruthy();
    const instructions = ramenBody.querySelector('.dish-instructions');
    expect(instructions).toBeTruthy();
  });

  it('should render skeletons for ingredients, instructions, and deferred token analytics placeholder during initial loading', async () => {
    await fixture.whenStable();

    const ramenBody = fixture.nativeElement.querySelector('[accordion-body]');
    const gridSkeletons = ramenBody.querySelectorAll('.dish-content-grid app-skeleton');
    expect(gridSkeletons.length).toBe(2);

    const allSkeletons = ramenBody.querySelectorAll('app-skeleton');
    expect(allSkeletons.length).toBe(3);

    const busyRegions = ramenBody.querySelectorAll('[aria-busy="true"]');
    expect(busyRegions.length).toBe(2);
    expect(busyRegions[0].querySelector('.sr-only')?.textContent).toBe('Generating recipe instructions...');
    expect(busyRegions[1].querySelector('.sr-only')?.textContent).toBe('Calculating recipe token usage...');
  });

  it('should render progressive ingredients and replace ingredients skeleton while keeping instructions and token analytics skeletons during active streaming', async () => {
    hostComponent.recipes.set({
      ramen: {
        ingredients: ['Fresh Ramen Noodles', 'Tonkotsu Broth', 'Chashu Pork'],
        recipe: '',
        recipeHtml: '',
      },
    });
    await fixture.whenStable();

    const ramenBody = fixture.nativeElement.querySelector('[accordion-body]');
    const gridSkeletons = ramenBody.querySelectorAll('.dish-content-grid app-skeleton');
    // Only the 4-line instructions skeleton remains inside .dish-content-grid
    expect(gridSkeletons.length).toBe(1);

    const allSkeletons = ramenBody.querySelectorAll('app-skeleton');
    // 1 instructions skeleton + 1 deferred token analytics placeholder skeleton
    expect(allSkeletons.length).toBe(2);

    const busyInstructions = ramenBody.querySelector('.dish-instructions [aria-busy="true"]');
    expect(busyInstructions).toBeTruthy();

    expect(ramenBody.textContent).toContain('Fresh Ramen Noodles');
    expect(ramenBody.textContent).toContain('Tonkotsu Broth');
    expect(ramenBody.textContent).toContain('Chashu Pork');
  });
});

describe('CulinaryDishListComponent - Slice 4: Recipe Completion, Deferred Token Analytics & Multi-Dish Isolation', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, CulinaryDishListComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.expandedDishNames.set(['Ramen', 'Sushi']);
    await fixture.whenStable();
  });

  it('should render recipe HTML and remove instructions skeleton when recipe is completed', async () => {
    hostComponent.recipes.set({
      ramen: {
        ingredients: ['Fresh Ramen Noodles'],
        recipe: '### Preparation\nBoil water.',
        recipeHtml: '<p class="recipe-step">Step 1: Boil water and add noodles.</p>',
      },
    });
    await fixture.whenStable();

    const accordionItems = fixture.nativeElement.querySelectorAll('app-accordion-item');
    const ramenBody = accordionItems[0].querySelector('[accordion-body]');
    const gridSkeletons = ramenBody.querySelectorAll('.dish-content-grid app-skeleton');
    expect(gridSkeletons.length).toBe(0);

    const recipeStep = ramenBody.querySelector('.recipe-step');
    expect(recipeStep).toBeTruthy();
    expect(recipeStep?.textContent).toBe('Step 1: Boil water and add noodles.');
  });

  it('should render skeleton placeholder prior to tokenSummary and hydrate full-width token analytics below .dish-content-grid upon completion', async () => {
    hostComponent.recipes.set({
      ramen: {
        ingredients: ['Fresh Ramen Noodles'],
        recipe: 'Step 1: Boil water.',
        recipeHtml: '<p>Step 1: Boil water.</p>',
      },
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const accordionItems = fixture.nativeElement.querySelectorAll('app-accordion-item');
    const ramenBody = accordionItems[0].querySelector('[accordion-body]');
    expect(ramenBody.querySelector('app-token-analytics')).toBeNull();
    expect(ramenBody.querySelectorAll('app-skeleton').length).toBe(1);
    expect(ramenBody.querySelector('[aria-busy="true"] .sr-only')?.textContent).toBe(
      'Calculating recipe token usage...',
    );

    hostComponent.recipes.set({
      ramen: {
        ingredients: ['Fresh Ramen Noodles'],
        recipe: 'Step 1: Boil water.',
        recipeHtml: '<p>Step 1: Boil water.</p>',
        tokenSummary: {
          totalTokenCount: 350,
          promptTokenCount: 100,
          thoughtsTokenCount: 0,
          cachedContentTokenCount: 0,
          outputTokenCount: 250,
        },
      },
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const hydratedAnalytics = ramenBody.querySelector('app-token-analytics');
    expect(hydratedAnalytics).toBeTruthy();
    expect(ramenBody.querySelector('.dish-content-grid app-token-analytics')).toBeNull();
    expect(ramenBody.querySelectorAll('app-skeleton').length).toBe(0);
  });

  it('should correctly isolate recipe details for multiple expanded dishes by dish.name', async () => {
    hostComponent.recipes.set({
      ramen: {
        ingredients: ['Ramen Broth'],
        recipe: 'Ramen recipe text',
        recipeHtml: '<p class="ramen-instructions">Simmer ramen broth for 12 hours.</p>',
      },
      sushi: {
        ingredients: ['Sushi Rice', 'Nori'],
        recipe: 'Sushi recipe text',
        recipeHtml: '<p class="sushi-instructions">Slice tuna and season sushi rice.</p>',
      },
    });
    await fixture.whenStable();

    const accordionItems = fixture.nativeElement.querySelectorAll('app-accordion-item');
    const ramenBody = accordionItems[0].querySelector('[accordion-body]');
    const sushiBody = accordionItems[1].querySelector('[accordion-body]');

    expect(ramenBody.querySelector('.ramen-instructions')?.textContent).toBe('Simmer ramen broth for 12 hours.');
    expect(ramenBody.querySelector('.sushi-instructions')).toBeNull();

    expect(sushiBody.querySelector('.sushi-instructions')?.textContent).toBe('Slice tuna and season sushi rice.');
    expect(sushiBody.querySelector('.ramen-instructions')).toBeNull();
  });
});

describe('CulinaryDishListComponent - Slice 5: Disabled State', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, CulinaryDishListComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should propagate isDisabled to accordion items and prevent dish selection when disabled', async () => {
    hostComponent.isDisabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const triggerButtons = fixture.nativeElement.querySelectorAll('button.accordion-trigger');
    expect(triggerButtons.length).toBe(2);
    expect(triggerButtons[0].disabled).toBe(true);
    expect(triggerButtons[1].disabled).toBe(true);

    triggerButtons[0].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(hostComponent.selectedDishes.length).toBe(0);
  });
});
