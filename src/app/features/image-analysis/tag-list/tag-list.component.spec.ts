import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TagListComponent } from './tag-list.component';

describe('TagListComponent', () => {
  let component: TagListComponent;
  let fixture: ComponentFixture<TagListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagListComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TagListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('tags', []);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render empty state message when tags are empty', async () => {
    fixture.componentRef.setInput('tags', []);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const emptyMsg = compiled.querySelector('.empty-state-text');
    expect(emptyMsg?.textContent).toContain('No tags detected yet');
  });

  it('should render badges when tags are provided', async () => {
    fixture.componentRef.setInput('tags', [
      { label: 'Sunset', tooltip: 'Scenic sunset view' },
      { label: 'Mountain', tooltip: 'Snowy mountain ridge' },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const badges = compiled.querySelectorAll('app-badge');
    expect(badges.length).toBe(2);
  });
});
