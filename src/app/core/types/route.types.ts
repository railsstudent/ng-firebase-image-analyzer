export const ROUTE_PATHS = {
  HOME: 'home',
  IMAGE_ANALYSIS: 'image-analysis',
} as const;

export type AppRoute = `/${(typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS]}`;

export interface NavLink {
  label: string;
  path: AppRoute;
}
