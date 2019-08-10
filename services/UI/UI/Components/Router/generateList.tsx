// UI/UI/Components/Router/generateList.tsx
import React, { useMemo } from 'react';
import { AppRoute } from 'UI/Components/Router/types';
import { ParentListItem } from '../Style/Lists/ListItem/ParentListItem';
import { LinkListItem } from '../Style/Lists/ListItem/LinkListItem';
import useReactRouter from 'use-react-router';
import { BaseList } from '../Style/Lists/BaseList';
import { useIsAuthed } from '../Providers/SessionProvider';

const startOpen = (route: AppRoute, path: string): boolean =>
  route.to === path ? true : route.children ? route.children.some(child => startOpen(child, path)) : false;

export function RouteList(props: { routes: AppRoute[] }): React.ReactElement {
  const { location } = useReactRouter();
  const { isAuthed, role } = useIsAuthed();

  const generateRoutesList = (routes: AppRoute[], path: string = '/'): React.ReactElement[] =>
    routes.map(({ authMode, Loadable, exact, ...route }) =>
      route.children ? (
        route.hidden ||
        (authMode !== isAuthed && typeof authMode !== 'undefined') ||
        (typeof route.role === 'undefined' || !role.includes(route.role)) ? (
          <React.Fragment key={route.to}>{generateRoutesList(route.children)}</React.Fragment>
        ) : (
          <ParentListItem startOpen={startOpen(route, path)} label={route.label} key={route.to}>
            <LinkListItem selected={location.pathname === route.to} key={route.to} to={route.to} label={route.label} />
            {generateRoutesList(route.children)}
          </ParentListItem>
        )
      ) : route.hidden ||
        (authMode !== isAuthed && typeof authMode !== 'undefined') ||
        (typeof route.role !== 'undefined' && typeof role !== 'undefined' && !role.includes(route.role)) ? (
        <React.Fragment key={route.to}></React.Fragment>
      ) : (
        <LinkListItem selected={location.pathname === route.to} key={route.to} {...route} />
      )
    );

  return useMemo(() => <BaseList>{generateRoutesList(props.routes, location.pathname)}</BaseList>, []);
}
