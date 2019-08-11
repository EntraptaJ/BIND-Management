// API/src/Utils/ACME/Certificate.ts
import { Client, forge, directory } from 'acme-client';
import { InstanceType } from 'typegoose';
import { Base64 } from 'js-base64';
import { User, BINDZONE } from '../../Models/User';
import { newOrder, performAuthorization } from '.';
import { ACMEAccounts, ACMEAccount, pubSub } from '../../Models/ACME';

interface GenerateCertificateArgs {
  domains: string[];
  domainName: string;
  user: InstanceType<User>;
  Zone: BINDZONE;
  email?: string;
}

export const findAccount = async (domainName: string): Promise<InstanceType<ACMEAccount>> =>
  ACMEAccounts.findOne({ domainName });

export const generateCertificate = async ({
  domains,
  domainName,
  user,
  Zone,
  email
}: GenerateCertificateArgs): Promise<InstanceType<ACMEAccount>> => {
  let ACMEAccount = await findAccount(domainName);
  let ACME: Client;
  if (ACMEAccount) {
    ACME = new Client({
      accountKey: ACMEAccount.privKey.buffer as Buffer,
      directoryUrl: directory.letsencrypt.production,
      accountUrl: ACMEAccount.accountURL
    });

    await ACME.createAccount({ onlyReturnExisting: true });

    ACMEAccount.domains = domains;
  } else {
    const privACMEKey = await forge.createPrivateKey(4096);
    console.log(`Generate `, privACMEKey);
    ACME = new Client({ accountKey: privACMEKey, directoryUrl: directory.letsencrypt.production });
    await ACME.createAccount({ termsOfServiceAgreed: true, contact: [`mailto:${email}`] });
    ACMEAccount = new ACMEAccounts({
      user: user._id,
      email: email,
      accountURL: ACME.getAccountUrl(),
      domains,
      domainName: domainName,
      privKey: privACMEKey
    });
  }

  const Order = await newOrder(ACME, domains);

  const authorizations = await ACME.getAuthorizations(Order);

  const promises = authorizations.map(auth => performAuthorization(ACME, auth, user, Zone));

  await Promise.all(promises);

  const [key, csr] = await forge.createCsr({
    commonName: domains[0],
    altNames: domains,
    keySize: 4096
  });

  await ACME.finalizeOrder(Order, csr);
  const cert = await ACME.getCertificate(Order);

  ACMEAccount.Certificate = {
    certificate: Base64.encode(cert),
    updatedDate: new Date(),
    privKey: Base64.encode(key.toString())
  };

  pubSub.publish(domainName, ACMEAccount);

  return ACMEAccount;
};
