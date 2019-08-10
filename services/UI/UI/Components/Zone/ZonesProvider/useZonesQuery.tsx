// UI/UI/Components/Zone/useZones.tsx
import { useQuery } from '@apollo/react-hooks';
import ZONES_GQL from './Zones.graphql';
import { Zone } from '../type';
import { ApolloQueryResult } from 'apollo-client';

interface ZonesQuery {
  Zones: Zone[];
}

export interface UseZonesQueryData {
  Zones: Zone[] | undefined;
  loading: boolean;
  refetch: () => Promise<ApolloQueryResult<ZonesQuery>>;
}

export function useZonesQuery(): UseZonesQueryData {
  const { data, loading, refetch } = useQuery<ZonesQuery>(ZONES_GQL);
  const Zones = data && data.Zones ? data.Zones : undefined;

  return { Zones, loading, refetch };
}
