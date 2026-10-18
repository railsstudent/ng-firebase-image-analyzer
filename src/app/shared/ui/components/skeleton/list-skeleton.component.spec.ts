import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ListSkeletonComponent } from './list-skeleton.component';
import { SkeletonComponent } from './skeleton.component';

describe('ListSkeletonComponent', () => {
  let component: ListSkeletonComponent;
  let fixture: ComponentFixture<ListSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListSkeletonComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ListSkeletonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have container with aria-hidden="true"', () => {
    const container = fixture.nativeElement.querySelector('div');
    expect(container?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should render 3 row items with circle and line skeletons', () => {
    const skeletonDirectives = fixture.debugElement.queryAll(By.directive(SkeletonComponent));
    // 3 rows, each row has 1 circle and 2 lines => 3 * 3 = 9 SkeletonComponent instances
    expect(skeletonDirectives.length).toBe(9);

    const circleSkeletons = skeletonDirectives.filter((s) => s.componentInstance.variant() === 'circle');
    expect(circleSkeletons.length).toBe(3);

    const lineSkeletons = skeletonDirectives.filter((s) => s.componentInstance.variant() === 'line');
    expect(lineSkeletons.length).toBe(6);
  });
});
