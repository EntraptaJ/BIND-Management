// UI/UI/Components/BlogList/index.tsx
import React from 'react';
// import { useQuery } from '@apollo/react-hooks';
import { List } from 'react-content-loader';
// import GET_ITEMS_GQL from './getItems.graphql';
// import { BaseList } from 'UI/Components/Style/Lists/BaseList';
// import { LabelListItem } from 'UI/Components/Style/Lists/ListItem/LabelListItem';

interface Item {
  name: string;
}

export function BlogList(): React.ReactElement {
  // const { data } = useQuery<{ getItems: Item[] }>(GET_ITEMS_GQL, { ssr: false, fetchPolicy: 'cache-first' });
  return <List style={{ width: '100%', height: '100%' }} />;
}

/**
  return !data || !data.getItems ? (
    
  ) : data && data.getItems ? (
    <BaseList>
      {data.getItems.map(({ name }, index) => (
        <LabelListItem key={index} label={name} />
      ))}
    </BaseList>
  ) : (
    <div>TODO ERROR</div>
  );
 */
