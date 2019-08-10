// UI/UI/Components/Zone/ZoneView/RRSelect/index.tsx
import React from 'react';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { ValueRRTypeENUM } from '../../type';

interface RRSelectProps {
  value: string;
  onChange: (value: any) => void;
}

export function RRSelect(props: RRSelectProps): React.ReactElement {
  return (
    <FormControl style={{ minWidth: 120 }}>
      <InputLabel htmlFor='RRType'>Record Type</InputLabel>
      <Select
        {...props}
        onChange={({ target }) => props.onChange(target.value)}
        inputProps={{
          name: 'RRType',
          id: 'RRType'
        }}
      >
        {Object.keys(ValueRRTypeENUM).map(RR => (
          <MenuItem key={RR} value={RR}>
            {RR}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
