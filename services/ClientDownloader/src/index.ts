import gql from 'graphql-tag';
import { initApollo } from './initApollo';
import { Base64 } from 'js-base64';
import { outputFile } from 'fs-extra';
import { loginUser } from './Login';
import { subscribeCertificate, getLatest } from './Certificate';


const username = process.env['USERNAME'] || 'username';
const password = process.env['PASSWORD'] || 'password';
const URL = process.env['URL'] || 'http://localhost/graphql';
const DOMAIN = process.env['DOMAIN'] || 'testing.kristianjones.dev';

async function startServer() {
  const client = initApollo({ token: await loginUser({ username, URL, password }), URL });

  // Check if current certificate is latest and download latest otherwise.
  getLatest(client, DOMAIN)

  // Subscribe for new certificates
  subscribeCertificate(client, DOMAIN);

}

startServer();
