// UI/UI/Components/Zone/ZoneProvider.tsx
import React, { createContext, PropsWithChildren, useContext } from 'react';
import { useZonesQuery, UseZonesQueryData } from './useZonesQuery';
// @ts-ignore
const ZonesContext = createContext<UseZonesQueryData>({ Zones: undefined, loading: true, refetch: () => {} });

export function ZonesProvider({ children }: PropsWithChildren<{}>): React.ReactElement {
  const value = useZonesQuery();

  return <ZonesContext.Provider value={value}>{children}</ZonesContext.Provider>;
}

export function useZones(): UseZonesQueryData {
  return useContext(ZonesContext);
}
