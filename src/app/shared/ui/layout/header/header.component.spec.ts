import { APP_NAV_LINKS, HOME_NAV_LINK } from '@/core/routing';
import { TerminalIconComponent } from '@/shared/ui/icons/terminal-icon/terminal-icon.component';
import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the component with default inputs', () => {
    expect(component).toBeTruthy();
    expect(component.title()).toBe('HomeComponent');
    expect(component.homeLink()).toEqual(HOME_NAV_LINK);
    expect(component.navLinks()).toEqual(APP_NAV_LINKS);
  });

  it('renders the brand anchor linking to homeLink with aria-label and terminal icon', () => {
    const brandLink: HTMLAnchorElement | null = fixture.nativeElement.querySelector('a.nav-brand-title');
    expect(brandLink).toBeTruthy();
    expect(brandLink?.getAttribute('href')).toBe('/home');
    expect(brandLink?.getAttribute('aria-label')).toBe('Home');

    const terminalIcon = fixture.debugElement.query(By.directive(TerminalIconComponent));
    expect(terminalIcon).toBeTruthy();

    const titleSpan = brandLink?.querySelector('span.hidden.sm\\:inline');
    expect(titleSpan?.textContent?.trim()).toBe('HomeComponent');
  });

  it('renders feature navigation links for Analysis and Culinary Guide without a Get Started CTA button', () => {
    const navLinkEls: NodeListOf<HTMLAnchorElement> = fixture.nativeElement.querySelectorAll('.nav-links a.nav-link');
    expect(navLinkEls.length).toBe(2);
    expect(navLinkEls[0]?.textContent?.trim()).toBe('Analysis');
    expect(navLinkEls[0]?.getAttribute('href')).toBe('/image-analysis');
    expect(navLinkEls[1]?.textContent?.trim()).toBe('Culinary Guide');
    expect(navLinkEls[1]?.getAttribute('href')).toBe('/culinary-guide');

    const ctaBtn = fixture.nativeElement.querySelector('.nav-cta-btn');
    expect(ctaBtn).toBeNull();
  });
});
