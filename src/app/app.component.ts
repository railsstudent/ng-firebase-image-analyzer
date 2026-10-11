import { PwaUpdateBannerComponent } from './pwa/pwa-update-banner/pwa-update-banner.component';
import { PwaUpdateService } from './pwa/pwa-update.service';
import { FooterComponent } from './shared/ui/layout/footer/footer.component';
import { HeaderComponent } from './shared/ui/layout/header/header.component';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, PwaUpdateBannerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  #pwaService = inject(PwaUpdateService);
  updateAvailable = this.#pwaService.updateAvailable;
}
