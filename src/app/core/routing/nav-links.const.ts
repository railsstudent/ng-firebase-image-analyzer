import type { AppLink } from './app-link.interface';
import { ROUTE_PATHS } from './route.const';

export const HOME_NAV_LINK: AppLink = {
  label: 'Home',
  path: `/${ROUTE_PATHS.HOME}`,
};

export const APP_NAV_LINKS: AppLink[] = [
  { label: 'Analysis', path: `/${ROUTE_PATHS.IMAGE_ANALYSIS}` },
  { label: 'Culinary Guide', path: `/${ROUTE_PATHS.CULINARY_GUIDE}` },
];
