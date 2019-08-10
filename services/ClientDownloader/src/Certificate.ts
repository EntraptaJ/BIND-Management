// ClientDownloader/src/Certificate.ts
import { outputFile, outputJSON, readJSON, pathExists } from 'fs-extra';
import ApolloClient from 'apollo-client';
import { Base64 } from 'js-base64';
import gql from 'graphql-tag';

const certificatePath = process.env['CERT_PATH'] || '';
const configPath = `${certificatePath}config.json`;

export const getLatest = async (client: ApolloClient<any>, domain: string) => {
  const Query = client.query<{ getLastUpdated: Date }>({
    query: gql`
      {
        getLastUpdated(input: { domainName: "${domain}" })
      }
    `
  });
  let Config: Promise<any> | { updatedDate: Date };
  if (!(await pathExists(configPath))) Config = { updatedDate: undefined };
  else Config = readJSON(configPath);

  const [
    {
      data: { getLastUpdated }
    },
    { updatedDate }
  ] = await Promise.all([Query, Config]);

  if (getLastUpdated !== updatedDate) return downloadCertificate(client, domain);
  else console.log('We have latest certificate');
};

interface SaveCertificateArgs {
  certificate: string;
  privKey: string;
  updatedDate: Date;
}

export const saveCertificate = async (domainName: string, { certificate, privKey, updatedDate }: SaveCertificateArgs) => {
  const CertificatePath = `${certificatePath}${domainName}.pem`;
  const KeyPath = `${certificatePath}${domainName}.key`;

  return Promise.all([
    outputFile(CertificatePath, certificate),
    outputFile(KeyPath, privKey),
    outputJSON(configPath, { updatedDate })
  ]);
};

interface Certificate {
  certificate: string;
  updatedDate: Date;
  privKey: string;
}

export interface ACMEAccount {
  domainName: string;
  Certificate: Certificate;
}

export const downloadCertificate = async (client: ApolloClient<any>, domain: string) => {
  const {
    data: {
      ACMECert: {
        domainName,
        Certificate: { certificate, privKey, updatedDate }
      }
    }
  } = await client.query<{ ACMECert: ACMEAccount }>({
    query: gql`{
    ACMECert(input: { domainName: "${domain}" }) {
      domainName
      Certificate {
        certificate
        privKey
        updatedDate
      }
    }
  }`
  });
  const PEMCertificate = Base64.decode(certificate);
  const PEMKey = Base64.decode(privKey);
  saveCertificate(domainName, { certificate: PEMCertificate, privKey: PEMKey, updatedDate });
};

export const subscribeCertificate = async (client: ApolloClient<any>, domain: string) => {
  client
    .subscribe<{ ACME: ACMEAccount }>({
      query: gql`subscription {
  ACME(domainName: "${domain}") {
    domainName
    Certificate {
      privKey
      certificate
      updatedDate
    }
  }
}`
    })
    .subscribe({
      next({
        data: {
          ACME: {
            domainName,
            Certificate: { certificate, privKey, updatedDate }
          }
        }
      }) {
        const PEMCertificate = Base64.decode(certificate);
        const PEMKey = Base64.decode(privKey);
        saveCertificate(domainName, { certificate: PEMCertificate, privKey: PEMKey, updatedDate });
        Promise.all([]);
      }
    });
};
