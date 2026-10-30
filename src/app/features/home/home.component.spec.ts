import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import HomeComponent from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the optimized hero image with priority, dimensions, and webp source', () => {
    const imgElement: HTMLImageElement | null = fixture.nativeElement.querySelector('img');
    expect(imgElement).not.toBeNull();
    expect(imgElement?.getAttribute('ngsrc')).toBe('/images/home.webp');
    expect(imgElement?.getAttribute('width')).toBe('512');
    expect(imgElement?.getAttribute('height')).toBe('382');
    expect(imgElement?.hasAttribute('priority')).toBe(true);
    expect(imgElement?.getAttribute('alt')).toBe('AI Image Analysis Illustration');
  });
});
