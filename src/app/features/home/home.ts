import { NavService } from '@/core/services/nav.service';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export default class Home {
  private readonly nav = inject(NavService);

  navigateTo() {
    this.nav.to('/image-analysis');
  }
}
