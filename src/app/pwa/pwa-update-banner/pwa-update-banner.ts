import { PwaUpdateService } from '@/pwa/services/pwa-update.service';
import { SystemUpdateAltIconComponent } from '@/shared/ui/icons/system-update-alt-icon/system-update-alt-icon.component';
import { Component, inject, signal } from '@angular/core';

@Component({
  selector: 'app-pwa-update-banner',
  imports: [SystemUpdateAltIconComponent],
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
