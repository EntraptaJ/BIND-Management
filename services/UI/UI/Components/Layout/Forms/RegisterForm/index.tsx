// UI/UI/Components/Layout/Forms/LoginForm/index.tsx
import React, { useState, useEffect } from 'react';
import { Form } from 'UI/Components/Style/Form';
import { ApolloError } from 'apollo-client';
import REGISTER_USER_GQL from './registerUser.graphql';
import { useMutation } from '@apollo/react-hooks';

interface FormData {
  username: string;
  password: string;
}

interface FormData {
  username: string;
  password: string;
}

interface ErrorItem {
  message?: string;
  code?: string;
  invalidField?: string;
  errorMessage: string;
}

const Errors: ErrorItem[] = [
  {
    code: 'INVALID_USER',
    invalidField: 'username',
    errorMessage: 'Username is already taken'
  }
];

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

interface User {
  username: string;
}

export function RegisterForm(): React.ReactElement {
  const [registerUserFN, { error }] = useMutation<{ registerUser: User }, { user: FormData }>(REGISTER_USER_GQL);
  const [invalid, setInvalid] = useState<ErrorItem>();

  const onSubmit = async (data: FormData): Promise<void> => {
    const response = await registerUserFN({ variables: { user: data } });
    if (response) window.location.href = '/Login';
  };

  useEffect(() => {
    if (typeof error !== 'undefined') setInvalid(processError(error));
  }, [error]);

  return (
    <Form<FormData>
      title='Register'
      invalid={invalid}
      onSubmit={onSubmit}
      Fields={[
        { label: 'Username', name: 'username', type: 'Text', inputType: 'text', autoComplete: 'username' },
        { label: 'Password', name: 'password', type: 'Text', inputType: 'password', autoComplete: 'new-password' }
      ]}
    />
  );
}
