const LOCAL_DOMAINS = ['localhost', '127.0.0.1', '::1', '[::1]'];

/**
 * Checks if the provided Window environment is running on a local host.
 * Safely handles null or undefined window references (SSR-safe).
 */
export function isLocalhost(win?: Window | null): boolean {
  if (!win?.location?.hostname) {
    return false;
  }
  return LOCAL_DOMAINS.includes(win.location.hostname);
}

/**
 * Utility function to check online status.
 * Must be invoked during an active injection context (e.g., in field initializers or constructors).
 *
 * @returns A function that queries the online status of the navigator.
 */
export function isOnline(win?: Window | null): boolean {
  return win?.navigator.onLine ?? true;
}
