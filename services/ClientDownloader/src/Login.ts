// src/Login.ts
import { ApolloClient } from 'apollo-client';
import gql from 'graphql-tag';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

interface LoginUserArgs {
  username: string;
  password: string;
  URL: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
}

export const loginUser = async ({ username, password, URL }: LoginUserArgs): Promise<string> => {
  const Response = await new ApolloClient({
    link: createHttpLink({
      uri: URL,
      fetch
    }),
    cache: new InMemoryCache()
  }).mutate<{ loginUser: LoginResponse }>({
    mutation: gql`mutation {
      loginUser(username: "${username}", password: "${password}" ) {
        success
        token
      }
    }`
  });

  return Response.data.loginUser.token;
};
