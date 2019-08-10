// UI/UI/Components/Zone/ZoneProvider/index.tsx
import React, { createContext, PropsWithChildren, useContext } from 'react';
import ZONE_GQL from './Zone.graphql';
import { useQuery } from '@apollo/react-hooks';
import { Zone } from '../type';
import { ApolloQueryResult } from 'apollo-client';

interface ZoneQuery {
  Zone: Zone;
}

export interface UseZoneQueryData {
  Zone: Zone | undefined;
  loading: boolean;
  refetch: () => Promise<ApolloQueryResult<ZoneQuery>>;
}

// @ts-ignore
const ZoneContext = createContext<UseZoneQueryData>({ Zone: undefined, loading: true, refetch: () => {} });

export function useZoneQuery(domainName: string): UseZoneQueryData {
  const { data, loading, refetch } = useQuery<ZoneQuery, { domainName: string }>(ZONE_GQL, { variables: { domainName } });
  const Zone = data && data.Zone ? data.Zone : undefined;

  return { Zone, loading, refetch };
}

export function ZoneProvider({ domainName, children }: PropsWithChildren<{ domainName: string }>): React.ReactElement {
  const value = useZoneQuery(domainName);

  return <ZoneContext.Provider value={value}>{children}</ZoneContext.Provider>;
}

export function useZone(): UseZoneQueryData {
  return useContext(ZoneContext)
}