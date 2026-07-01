import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer-bar">
      <div class="footer-container">
        <div class="footer-brand">
          <span class="material-symbols-outlined text-white">terminal</span>
          <span class="footer-brand-title">Firebase AI Logic</span>
        </div>
        <span class="footer-copyright">
          &copy; 2026 Hybrid & On-device Image Analyzer. Built with Angular, Gemini, Firebase AI Logic & Tailwind.
        </span>
      </div>
    </footer>
  `,
  styleUrl: './footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {}
