// UI/UI/Routes/Admin/Home.tsx
import React from 'react';
import { Section } from 'UI/Components/Layout/Section';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { useStyles } from './Styles';
import Delete from '@material-ui/icons/Delete';
import AddCircle from '@material-ui/icons/AddCircle';

interface Network {
  name: string;
  VLAN: number;
}

const Networks: Network[] = [{ name: 'Server Management', VLAN: 300 }];

export default function AdminHome(): React.ReactElement {
  const classes = useStyles();

  const onClick = (): void => console.log(`I've been clicked`);

  return (
    <>
      <Section
        background='secondary'
        title={{ title: 'Administration', message: 'This is the administration portal' }}
        className={classes.topSection}
      >
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
          <Typography variant='h6'>Zones</Typography>
          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Typography variant='h3' align='center'>
              10
            </Typography>
          </div>
        </Paper>
      </Section>
      <Section className={classes.userTable}>
      </Section>
      {/*       <Section className={classes.userTable}>
        <MaterialTable
          style={{ width: '100%' }}
          columns={[{ title: 'Username', field: 'name' }]}
          detailPanel={rowData => (
            <>
              <Typography variant='body1'>{rowData.name}</Typography>
            </>
          )}
          actions={[
            {
              icon: () => <Delete />,
              tooltip: 'Delete',
              onClick
            }
          ]}
          data={[{ name: 'KristianFJones' }]}
          title='User Management'
        />
      </Section> */}
    </>
  );
}
