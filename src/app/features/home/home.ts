import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavService } from '@/core/services/nav.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Home {
  private readonly nav = inject(NavService);

  navigateTo() {
    this.nav.to('/image-analysis');
  }
}
