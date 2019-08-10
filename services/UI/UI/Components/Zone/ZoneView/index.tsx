// UI/UI/Components/Zone/ZoneView/index.tsx
import React, { useState } from 'react';
import Loadable from 'react-loadable';
import { useZone } from '../ZoneProvider';
import { useStyles } from './Styles';
import { Section } from 'UI/Components/Layout/Section';
import Refresh from '@material-ui/icons/Refresh';
import Delete from '@material-ui/icons/Delete';
import { RRSelect } from './RRSelect';
import NEW_RR_GQL from './NewRR.graphql';
import UPDATE_RR_GQL from './updateRR.graphql';
import { useMutation } from '@apollo/react-hooks';
import { NewRRInput, Zone as ZoneType, ValueRRTypeRecord, UpdateRRInput, ValueRRRecords, RRTypes } from '../type';
import { Alert } from 'UI/Components/Style/Alert';

const Table = Loadable<import('material-table').MaterialTableProps<ValueRRTypeRecord>>({
  loader: () => import('material-table'),
  loading: () => <></>
});

interface Alert {
  message: string;
  success: boolean;
}

export function ZoneView(): React.ReactElement {
  const { Zone, refetch } = useZone();
  const [alert, setAlert] = useState<Alert>();
  const [updateRRFN] = useMutation<{ updateRR: ZoneType }, { input: UpdateRRInput }>(UPDATE_RR_GQL);
  const [newRRFN] = useMutation<{ newRR: ZoneType }, { input: NewRRInput }>(NEW_RR_GQL);
  const classes = useStyles();

  const canEdit = Zone ? Zone.userPermission === 'ADMIN' || Zone.userPermission === 'WRITE' : false;

  const addRecord = async (): Promise<void> => {};

  const updateRR = async (type: RRTypes, oldRR: ValueRRRecords, newRR?: ValueRRRecords): Promise<void> => {
    if (!Zone) return setAlert({ message: 'Unknown Zone', success: false });
    const res = await updateRRFN({
      variables: {
        input: {
          domainName: Zone.domain,
          oldRR: { ...oldRR, ttl: oldRR.ttl || undefined },
          newRR,
          type
        }
      }
    });
    if (res && res.data && res.data.updateRR) {
      refetch();
      setAlert({ success: true, message: 'Record has been updated successfully' });
    }
    console.log(res);
  };
  return (
    <>
      <Section
        background='secondary'
        title={{ title: Zone ? `${Zone.domain} Management` : '', message: 'This is where you manage your DNS zones' }}
        className={classes.topSection}
      />
      <Table
        actions={[
          {
            icon: () => <Refresh />,
            tooltip: 'Refresh',
            isFreeAction: true,
            onClick: () => refetch()
          },
          ({ type, host, value, ttl }) => ({
            icon: () => <Delete />,
            tooltip: 'Delete Record',
            onClick: () => updateRR(type, { host, value, ttl: ttl || undefined }),
            hidden: Zone ? Zone.userPermission !== 'ADMIN' : true
          })
        ]}
        columns={[
          { field: 'host', title: 'Host', editable: canEdit ? 'always' : 'never' },
          { field: 'ttl', title: 'TTL', type: 'numeric', emptyValue: 'Default', editable: canEdit ? 'always' : 'never' },
          {
            field: 'type',
            title: 'Type',
            editable: 'onAdd',
            editComponent: (props) => <RRSelect {...props} />
          },
          { field: 'value', title: 'Value', grouping: false, editable: canEdit ? 'always' : 'never' }
        ]}
        data={Zone && Zone.RRs ? Zone.RRs : []}
        title={Zone ? `${Zone.domain} Zone` : ''}
        editable={{
          onRowUpdate: (
            { host: newHost, ttl: newTTL = undefined, value: newValue },
            // @ts-ignore
            { host, value, ttl, type }
          ) => updateRR(type, { host, value, ttl }, { host: newHost, ttl: parseInt(newTTL), value: newValue }),
          onRowAdd: async ({ type, ...RR }) => {
            const response = await newRRFN({
              variables: {
                input: {
                  domainName: Zone ? Zone.domain : '',
                  type,
                  // @ts-ignore
                  RR: { ...RR, ttl: RR.ttl ? parseInt(RR.ttl) : undefined }
                }
              }
            });
            console.log(response);
            await refetch();
          }
        }}
        options={{
          maxBodyHeight: '65.5vh',
          grouping: false,
          paging: true
        }}
      />
      {alert && <Alert open={true} {...alert} />}
    </>
  );
}
