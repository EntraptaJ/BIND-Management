// UI/UI/Routes/Zone/Zones.tsx
import React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Section } from 'UI/Components/Layout/Section';
import { ZonesProvider, useZones } from 'UI/Components/Zone/ZonesProvider';
import { ZonesTable } from 'UI/Components/Zone/ZonesTable';
import { useStyles } from './Styles';

function ZoneCounter(): React.ReactElement {
  const matches = useMediaQuery('(min-width:600px)');
  const { Zones } = useZones();
  if (!matches) return <></>
  const Title = Zones ? (Zones.length <= 1 ? 'Zone' : 'Zones') : 'Zones';

  const Count = Zones ? Zones.length : undefined;

  return (
    <Paper
      elevation={8}
      style={{
        alignSelf: 'flex-end',
        position: 'absolute',
        right: '2em',
        height: '150px',
        padding: '1em',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Typography variant='h6'>{Title}</Typography>
      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <Typography variant='h3' align='center'>
          {Count}
        </Typography>
      </div>
    </Paper>
  );
}

export default function ZonesRoute(): React.ReactElement {
  const classes = useStyles();
  return (
    <ZonesProvider>
      <Section
        background='secondary'
        title={{ title: 'Zone Management', message: 'This is where you manage your DNS zones' }}
        className={classes.topSection}
      >
        <ZoneCounter />
      </Section>
      <ZonesTable />
    </ZonesProvider>
  );
}
