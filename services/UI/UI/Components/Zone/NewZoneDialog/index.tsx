// UI/UI/Components/Zone/NewZoneDialog/index.tsx
import React, { useState, ChangeEvent, Props } from 'react';
import NEW_ZONE_GQL from './NewZone.graphql';
import { useMutation } from '@apollo/react-hooks';
import { Zone } from '../type';
import { FormDialog } from 'UI/Components/Style/Dialog/FormDialog';
import TextField from '@material-ui/core/TextField';
import { useZones } from '../ZonesProvider';

interface NewZoneDialogProps {
  open: boolean;
  onClose: (action: 'cancel' | 'submit') => any;
}

interface Value {
  domainName: string;
}

export function NewZoneDialog({ open, onClose }: NewZoneDialogProps): React.ReactElement {
  const [newZoneFN, { loading }] = useMutation<{ newZone: Zone }, { input: Value }>(NEW_ZONE_GQL);
  const [value, setValue] = useState<Value>();
  const ZonesData = useZones();

  const getValue = (field: keyof Value): string => (value ? value[field] : '');

  const handleChange = (field: keyof Value): ((e: ChangeEvent<HTMLInputElement>) => void) => ({ target }) =>
    setValue({ ...value, [field]: target.value });

  const onAction = (action: 'cancel' | 'submit'): (() => Promise<void>) => async () => {
    if (action === 'cancel') return onClose('cancel');
    else if (action === 'submit') {
      if (!value) return onClose('cancel');
      const response = await newZoneFN({ variables: { input: value } });
      if (response && response.data && response.data.newZone) {
        if (ZonesData) return Promise.all([onClose('submit'), ZonesData.refetch()]);
      }
    }
  };

  return (
    <FormDialog title='New Zone' body='Add a new Zone' onAction={onAction} open={open} loading={loading}>
      <TextField value={getValue('domainName')} onChange={handleChange('domainName')} label='Domain Name' />
    </FormDialog>
  );
}
