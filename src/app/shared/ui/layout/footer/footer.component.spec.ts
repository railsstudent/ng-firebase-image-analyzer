import { TerminalIconComponent } from '@/shared/ui/icons/terminal-icon/terminal-icon.component';
import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-22T00:00:00Z'));

    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize copyrightYear from the current system year', () => {
    expect(component).toBeTruthy();
    expect(component.copyrightYear).toBe(2026);
  });

  it('renders <app-terminal-icon> inside .footer-container without .footer-brand-title', () => {
    const brandDebugEl = fixture.debugElement.query(By.css('.footer-container > .flex'));
    expect(brandDebugEl).toBeTruthy();

    const terminalIcon = brandDebugEl.query(By.directive(TerminalIconComponent));
    expect(terminalIcon).toBeTruthy();

    const brandTitle = fixture.nativeElement.querySelector('.footer-brand-title');
    expect(brandTitle).toBeNull();
  });

  it('renders the copyright year and technology stack including Firebase App Hosting in .footer-copyright', () => {
    const copyrightEl: HTMLElement | null = fixture.nativeElement.querySelector('.footer-copyright');
    expect(copyrightEl).toBeTruthy();

    const normalizedText = copyrightEl?.textContent?.replace(/\s+/g, ' ').trim();
    expect(normalizedText).toBe(
      '© 2026 Hybrid & On-device Image Analyzer. Built with Angular, Gemini, Firebase AI Logic, Firebase App Hosting & Tailwind.',
    );
  });
});
