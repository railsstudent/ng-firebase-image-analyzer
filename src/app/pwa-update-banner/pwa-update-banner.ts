import { PwaUpdateService } from '@/core/services/pwa-update.service';
import { Component, inject, signal } from '@angular/core';

@Component({
  selector: 'app-pwa-update-banner',
  templateUrl: './pwa-update-banner.html',
  styleUrl: './pwa-update-banner.css',
})
export class PwaUpdateBanner {
  protected readonly pwaUpdateService = inject(PwaUpdateService);
  protected readonly isDismissed = signal(false);

  dismiss(): void {
    this.isDismissed.set(true);
  }
}
