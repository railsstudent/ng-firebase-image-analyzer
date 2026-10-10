import { TerminalIconComponent } from '@/shared/ui/icons/terminal-icon/terminal-icon.component';
import { Component, computed } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [TerminalIconComponent],
  template: `
    <footer class="footer-bar">
      <div class="footer-container">
        <div class="footer-brand">
          <app-terminal-icon class="text-white" />
          <span class="footer-brand-title">Firebase AI Logic</span>
        </div>
        <span class="footer-copyright">
          &copy; {{ copyrightYear() }} Hybrid & On-device Image Analyzer. Built with Angular, Gemini, Firebase AI Logic
          & Tailwind.
        </span>
      </div>
    </footer>
  `,
  styleUrl: './footer.css',
})
export class Footer {
  copyrightYear = computed(() => new Date(Date.now()).getFullYear());
}
