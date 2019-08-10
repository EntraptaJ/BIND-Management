// UI/UI/Components/Providers/SessionProvider/index.tsx
// KristianFJones <me@kristianjones.xyz>
import React, { createContext, useContext, FunctionComponent, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import ISAUTHED_GQL from 'UI/GraphQL/isAuthed.graphql';
import LOGIN_GQL from 'UI/GraphQL/loginUser.graphql';
import { useCookies } from 'react-cookie';
import { MutationResult } from '@apollo/react-common';

export type UserRole = 'Guest' | 'User' | 'Admin';

export interface Session {
  isAuthed: boolean;
  role: UserRole[];
}

const SessionContext = createContext<Session>({
  isAuthed: false,
  role: ['Guest']
});

type useIsAuthedType = () => { isAuthed: boolean; role: UserRole[] };

export const useToken = (): [string, setToken, deleteToken] => {
  const [token, setCookieToken, deleteCookieToken] = useCookies();
  const setToken = (token?: string): void => setCookieToken('token', token, { path: '/' });
  const deleteToken = (): void => deleteCookieToken('token');
  return [token['token'], setToken, deleteToken];
};

export const useIsAuthed: useIsAuthedType = () => {
  const [token] = useToken();
  const { data, refetch } = useQuery<{ userCheck: { isAuthed: boolean; role: UserRole[] } }>(ISAUTHED_GQL);
  const isAuthed = data && data.userCheck ? data.userCheck.isAuthed : false;
  const role = data && data.userCheck ? data.userCheck.role : (['Guest'] as UserRole[]);

  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (typeof refetch === 'function') refetch();
  }, [token]);
  return { isAuthed, role: role };
};

const SessionProvider: FunctionComponent = ({ children }) => {
  const sessionValue = useIsAuthed();
  return <SessionContext.Provider value={sessionValue}>{children}</SessionContext.Provider>;
};

export default SessionProvider;

export const useSession = (): Session => {
  return useContext(SessionContext);
};

interface User {
  username: string;
  password: string;
}

interface LoginUserResponse {
  success: boolean;
  token: string;
  role: 'User' | 'Admin';
}

type LoginType = (user: User) => Promise<boolean>;

type setToken = (token?: string) => void;
type deleteToken = () => void;

export const useLogin = (): [LoginType, MutationResult] => {
  const [, setToken] = useToken();
  const [loginUser, { ...extra }] = useMutation<{ loginUser: LoginUserResponse }, User>(LOGIN_GQL);
  const LoginFN: LoginType = async ({ username, password }) => {
    const response = await loginUser({ variables: { username, password } });
    if (response && response.data && response.data.loginUser.success) {
      setToken(response.data.loginUser.token);
      return true;
    } else return false;
  };
  return [LoginFN, { ...extra }];
};

export const useLogout = (): [() => Promise<void>] => {
  const [, , deleteToken] = useToken();
  const LogoutFN = async (): Promise<void> => deleteToken();
  return [LogoutFN];
};
