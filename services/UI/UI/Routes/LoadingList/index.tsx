// UI/UI/Routes/LoadingList/index.tsx
import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { List } from 'react-content-loader';
import GET_ITEMS_GQL from './getItems.graphql';
import { BaseList } from 'UI/Components/Style/Lists/BaseList';
import { LabelListItem } from 'UI/Components/Style/Lists/ListItem/LabelListItem';
import { Box } from 'UI/Components/Style/Box';

interface Item {
  name: string;
}

function LoadingList(): React.ReactElement {
  const { data, loading } = useQuery<{ getItems: Item[] }>(GET_ITEMS_GQL, { ssr: false, fetchPolicy: 'cache-first' });

  return (
    <Box title='Loading List'>
      {!data || !data.getItems ? (
        <List style={{ width: '100%', height: '100%' }} />
      ) : data && data.getItems ? (
        <BaseList fullWidth>
          {data.getItems.map(({ name }, index) => (
            <LabelListItem key={index} label={name} />
          ))}
        </BaseList>
      ) : (
        <div>TODO ERROR</div>
      )}
    </Box>
  );
}

export default LoadingList;
