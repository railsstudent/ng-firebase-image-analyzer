import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: ` <footer class="footer-container">
    <div class="footer-content">
      <p>&copy; 2026 Hybrid & On-device Image Analyzer. Built with Angular, Gemini, Firebase AI Logic & Tailwind.</p>
    </div>
  </footer>`,
  styleUrl: './footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {}
