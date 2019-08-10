// UI/UI/Components/Router/useRoute.tsx
import { useMemo } from 'react';
import { AppRoute } from 'UI/Components/Router/types';
import { AppRoutes } from './AppRoutes';

export const useRoute = (path: string): AppRoute | undefined => {
  const findRoute = (routes: AppRoute[], path: string): AppRoute | undefined => {
    for (const route of routes) {
      if (route.to === path) return route;
      if (path.replace(/\/$/, '') === route.to) return route;
      else if (route.children) return findRoute(route.children, path);
    }
  };
  // @ts-ignore
  return useMemo(() => findRoute(AppRoutes, path), [path]);
};
