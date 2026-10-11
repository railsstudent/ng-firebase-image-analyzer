import { ROUTE_PATHS } from './route.const';

type AppRoute = `/${(typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS]}`;

export interface AppLink {
  label: string;
  path: AppRoute;
}
