// UI/UI/Components/Zone/ZonesTable/index.tsx
import React, { useState } from 'react';
import Table from 'material-table'
import AddCircle from '@material-ui/icons/AddCircle';
import Refresh from '@material-ui/icons/Refresh';
import Delete from '@material-ui/icons/Delete';
import { useZones } from '../ZonesProvider';
import { Section } from 'UI/Components/Layout/Section';
import { NewZoneDialog } from '../NewZoneDialog';
import { Zone, DeleteZoneInput } from '../type';
import useRouter from 'use-react-router';
import DELETE_ZONE_GQL from './DeleteZone.graphql';
import { useMutation } from '@apollo/react-hooks';
import { Alert } from 'UI/Components/Style/Alert';
import { ConfirmDialog, ButtonTypes } from 'UI/Components/Style/Dialog/ConfirmDialog';

interface DeleteZoneResponse {
  success: boolean;
}

interface Alert {
  message: string;
  success: boolean;
}

interface Dialog {
  title?: string;
  body?: string;
  open: boolean;
  loading: boolean;
  domainName: string;
}

export function ZonesTable(): React.ReactElement {
  const { history } = useRouter();
  const [deleteZoneFN] = useMutation<{ deleteZone: DeleteZoneResponse }, { input: DeleteZoneInput }>(DELETE_ZONE_GQL);
  const [newZoneDialogOpen, setNewZoneDialogOpen] = useState<boolean>(false);
  const [alert, setAlert] = useState<Alert>();
  const [dialog, setDialog] = useState<Dialog>({ open: false, domainName: '', loading: false });
  const { Zones, refetch } = useZones();
  const { domainName } = dialog;

  const toggleNewZoneDialog = (): void => setNewZoneDialogOpen(!newZoneDialogOpen);

  const toggleDialog = (): void => setDialog({ ...dialog, open: !dialog.open });

  const openDialog = (domain: string, title: string, body: string): void =>
    setDialog({ ...dialog, title, body, open: true, domainName: domain });

  const onSelection = (action: ButtonTypes): (() => Promise<any>) => async () => {
    if (dialog) {
      if (action === 'cancel') return toggleDialog();
      setDialog({ ...dialog, loading: true });
      const Response = await deleteZoneFN({ variables: { input: { domainName } } });
      if (Response && Response.data && Response.data.deleteZone.success) {
        setAlert({ message: 'Zone deleted successfully', success: true });
        await refetch();
        toggleDialog();
      } else {
        setAlert({ message: 'Error occurred while deleting zone', success: false });
      }
    }
  };

  const onNewZoneClose = (a: 'cancel' | 'submit'): void => {
    if (a === 'submit') setAlert({ success: true, message: 'Zone created successfully' });
    toggleNewZoneDialog();
  };

  const onRowClick = (a: unknown, Zone?: Zone): void => {
    if (Zone) history.push(`/Zones/${Zone.domain}`);
  };

  return (
    <>
      <Section>
        <Table
          style={{ width: '100%' }}
          columns={[{ title: 'Domain Name', field: 'domain', sorting: true, defaultSort: 'asc' }]}
          actions={[
            {
              icon: () => <AddCircle />,
              tooltip: 'Add Network',
              isFreeAction: true,
              onClick: toggleNewZoneDialog
            },
            {
              icon: () => <Refresh />,
              tooltip: 'Refresh',
              isFreeAction: true,
              onClick: () => refetch()
            },
            rowData => ({
              icon: () => <Delete />,
              tooltip: 'Delete Zone',
              onClick: () =>
                openDialog(rowData.domain, 'Confirm Zone Deletion', `Are you sure you want to delete ${rowData.domain}`),
              hidden: rowData ? rowData.userPermission !== 'ADMIN' : true
            })
          ]}
          onRowClick={onRowClick}
          data={Zones || []}
          title='DNS Zones'
        />
      </Section>
      <NewZoneDialog open={newZoneDialogOpen} onClose={onNewZoneClose} />
      {alert && <Alert open={true} {...alert} />}
      <ConfirmDialog open={true} onSelection={onSelection} {...dialog} />
    </>
  );
}
