// UI/UI/Routes/Zone/Zone.tsx
import React from 'react';
import { RouteComponentProps, Redirect } from 'react-router';
import { ZoneProvider } from 'UI/Components/Zone/ZoneProvider';
import { ZoneView } from 'UI/Components/Zone/ZoneView';

export default function ZoneRoute(props: RouteComponentProps<{ domainName: string }>): React.ReactElement {
  if (!props.match.params.domainName) return <Redirect to='/' />;
  return (
    <ZoneProvider domainName={props.match.params.domainName}>
      <ZoneView />
    </ZoneProvider>
  );
}
