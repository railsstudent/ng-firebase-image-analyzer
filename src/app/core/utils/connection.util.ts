import { inject } from '@angular/core';
import { WINDOW } from '@/core/constants/navigator.const';

/**
 * Utility function to check online status.
 * Must be invoked during an active injection context (e.g., in field initializers or constructors).
 *
 * @returns A function that queries the online status of the navigator.
 */
export function injectOnlineStatus(): () => boolean {
  const win = inject(WINDOW);
  return () => win?.navigator.onLine ?? true;
}
