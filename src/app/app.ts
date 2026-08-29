import { NavService } from '@/core/services/nav.service';
import { PwaUpdateBanner } from '@/pwa-update-banner/pwa-update-banner';
import { Footer } from '@/shared/ui/layout/footer/footer';
import { Header } from '@/shared/ui/layout/header/header';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, PwaUpdateBanner],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly nav = inject(NavService);
}
