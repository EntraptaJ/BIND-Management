// UI/UI/Components/Layout/Forms/LoginForm/index.tsx
import React, { useState, useEffect } from 'react';
import { Form } from 'UI/Components/Style/Form';
import { ApolloError } from 'apollo-client';
import { useMutation } from '@apollo/react-hooks';
import SAVE_INITIAL_SETTINGS_GQL from './saveInitialSettings.graphql';

interface FormData {
  appName: string;
  username: string;
  password: string;
}

interface ErrorItem {
  message?: string;
  code?: string;
  invalidField?: string;
  errorMessage: string;
}

const Errors: ErrorItem[] = [];

const processError = ({ graphQLErrors }: ApolloError): ErrorItem | undefined => {
  for (const error of graphQLErrors) {
    const Item = Errors.find(itm =>
      Object.entries(error).some(([type, value]) =>
        value !== 'null' && typeof value === 'object'
          ? Object.entries(value).some(
              ([type, value]) => typeof itm[type as keyof ErrorItem] !== 'undefined' && itm[type as keyof ErrorItem] === value
            )
          : typeof itm[type as keyof ErrorItem] !== 'undefined' && itm[type as keyof ErrorItem] === value
      )
    );
    if (Item) return Item;
  }
  return undefined;
};

export function SetupForm(): React.ReactElement {
  const [saveSettingsFN, { error }] = useMutation<{ saveInitialSettings: boolean }, { input: FormData }>(
    SAVE_INITIAL_SETTINGS_GQL
  );
  const [invalid, setInvalid] = useState<ErrorItem>();
  const onSubmit = async (data: FormData): Promise<void> => {
    const response = await saveSettingsFN({ variables: { input: data } });
    if (response) window.location.href = '/';
  };

  useEffect(() => {
    if (typeof error !== 'undefined') setInvalid(processError(error));
  }, [error]);

  return (
    <Form<FormData>
      title='Setup'
      submitLabel='Setup Application'
      invalid={invalid}
      onSubmit={onSubmit}
      Fields={[
        { label: 'App Name', name: 'appName', type: 'Text', inputType: 'text' },
        { label: 'Username', name: 'username', type: 'Text', inputType: 'text', autoComplete: 'username' },
        { label: 'Password', name: 'password', type: 'Text', inputType: 'password', autoComplete: 'new-password' },
        { label: 'NS Public Hostname', name: 'publicNSHostname', type: 'Text', inputType: 'text' }
      ]}
    />
  );
}
