import { PwaUpdateService } from '@/pwa/pwa-update.service';
import { DownloadIconComponent } from '@/shared/ui/icons/download-icon/download-icon.component';
import { Component, inject, signal } from '@angular/core';

@Component({
  selector: 'app-pwa-update-banner',
  imports: [DownloadIconComponent],
  templateUrl: './pwa-update-banner.component.html',
  styleUrl: './pwa-update-banner.component.css',
})
export class PwaUpdateBannerComponent {
  readonly pwaUpdateService = inject(PwaUpdateService);
  readonly isDismissed = signal(false);

  dismiss(): void {
    this.isDismissed.set(true);
  }
}
