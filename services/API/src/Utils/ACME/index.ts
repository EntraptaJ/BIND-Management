// API/src/Utils/ACME/index.ts
import { Authorization, Client, Order, Identifier } from 'acme-client';
import { ForbiddenError } from 'type-graphql';
import { InstanceType } from 'typegoose';
import { RRTypeENUM, ValueRRRecordInput } from '../../Models/ResourceRecords';
import { BINDZONE, User } from '../../Models/User';
import { NewRR, removeRR, saveZone } from '../BIND/Zones';
import { restartBIND } from '../Docker/NS';

const NSContainer = process.env['NS'] || 'NS1';

export const generateTXTRecord = (Zone: BINDZONE, RR: ValueRRRecordInput): void => NewRR(Zone, { type: RRTypeENUM['TXT'], RR });

export const removeTXTRecord = (Zone: BINDZONE, RR: ValueRRRecordInput): void =>
  removeRR(Zone, { type: RRTypeENUM['TXT'], RR });

export const getHost = (recordDomain: string, zoneDomain: string): string => {
  const splitHost = recordDomain.split(`.${zoneDomain}`);
  return recordDomain !== zoneDomain ? `_acme-challenge.${splitHost[0]}` : `_acme-challenge`;
};

export const performAuthorization = async (
  ACME: Client,
  Auth: Authorization,
  user: InstanceType<User>,
  Zone: BINDZONE
): Promise<void> => {
  const challenge = Auth.challenges.filter(({ type }) => type === 'dns-01').pop();
  if (!Zone) throw new ForbiddenError();

  const host = getHost(Auth.identifier.value, Zone.zoneFile);

  const keyAuthorization = await ACME.getChallengeKeyAuthorization(challenge);

  try {
    // Add TXT record
    await generateTXTRecord(Zone, { host, value: keyAuthorization, ttl: 10 });

    await saveZone(Zone, Zone.zoneFile);

    await restartBIND(NSContainer);

    /* Verify that challenge is satisfied */
    await ACME.verifyChallenge(Auth, challenge);

    /* Notify ACME provider that challenge is satisfied */
    await ACME.completeChallenge(challenge);

    /* Wait for ACME provider to respond with valid status */
    await ACME.waitForValidStatus(challenge);
  } catch {
  } finally {
    try {
      await removeTXTRecord(Zone, { host, value: keyAuthorization, ttl: 10 });
      await saveZone(Zone, Zone.zoneFile);

      await restartBIND(NSContainer);
    } catch {}
  }
};

export const generateDomains = (subDomains: string[], domainName: string): string[] => {
  const Domains: string[] = [domainName];
  for (const subDomain of subDomains) {
    Domains.push(`${subDomain}.${domainName}`);
  }

  return Domains;
};

const createIdentifiers = (domains: string[]): Identifier[] => {
  const Identifiers: Identifier[] = [];
  for (const domain of domains) {
    Identifiers.push({ type: 'dns', value: domain });
  }

  return Identifiers;
};

export const newOrder = async (ACME: Client, domains: string[]): Promise<Order> =>
  ACME.createOrder({ identifiers: createIdentifiers(domains) });
