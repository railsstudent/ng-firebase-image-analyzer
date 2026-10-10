import { NavService } from '@/core/services/nav.service';
import { ArrowForwardIconComponent } from '@/shared/ui/icons/arrow-forward-icon/arrow-forward-icon.component';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [ArrowForwardIconComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export default class Home {
  private readonly nav = inject(NavService);

  async navigateTo(): Promise<void> {
    await this.nav.to('/image-analysis');
  }
}
