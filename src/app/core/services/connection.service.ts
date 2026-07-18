import { NAVIGATOR } from '@/core/constants/navigator.const';
import { inject, Service } from '@angular/core';

@Service()
export class ConnectionService {
  #navigator = inject(NAVIGATOR);

  getOnlineStatus(): boolean {
    return this.#navigator?.onLine ?? true;
  }
}
