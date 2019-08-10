// API/src/Utils/BIND/Zones.ts
import { readFile, writeFile } from 'fs-extra';
import klaw from 'klaw';
import pEvent from 'p-event';
import path from 'path';
import { parseZoneFile, ZONE, generateZoneFile } from 'ts-zone-file';
import { addZoneConfig } from './Config';
import { Zone, ZONE_PATH } from '../../Models/Zone';
import { ValueRRRecordInput, RRTypeENUM } from '../../Models/ResourceRecords';
import { ApolloError } from 'apollo-server-koa';
import { bindConfig } from '../../Models/BINDConfig';
import { BINDZONE } from '../../Models/User';

export const getZoneFiles = async (): Promise<{ name: string }[]> => {
  // Recursively walk the /zones folder
  const walk = klaw(ZONE_PATH, {});

  // Convert the walk into an AsyncIterableIterator
  const files: AsyncIterableIterator<klaw.Item> = pEvent.iterator(walk, 'data', {
    resolutionEvents: ['end']
  });

  /**
   * Array of zone files within the /zones folder of the filesystem
   */
  const zones: { name: string }[] = [];
  for await (const file of files) {
    // We don't want the directories themselves only files
    if (file.stats.isDirectory()) continue;
    // if file then parse the path and extract the filename as base
    const { base: fileName } = path.parse(file.path);
    if (fileName.includes('.jnl')) continue;
    zones.push({ name: fileName });
  }

  return zones.sort().reverse();
};

export const loadZone = async (domain: string): Promise<BINDZONE> => {
  const domains = await getZoneFiles();
  const domainName = domains.find(a => domain.includes(a.name));
  if (!domainName) throw new Error('ZONE FILE DOES NOT EXIST');
  const file = await readFile(`${ZONE_PATH}/${domainName.name}`);
  return { ...((await parseZoneFile(file.toString())) as ZONE), zoneFile: domainName.name };
};

/**
 * Takes a BIND9 Zone Object and sets the SOA to YYYYMMDD## and if it is the same day it will increment ## by one.
 * @param zone BIND9 Zone Object {@link ZONE}
 */
export const updateSOA = async (zone: ZONE): Promise<void> => {
  const today = new Date();

  const year = today.getFullYear();

  const month = `${today.getMonth() + 1}`.padStart(2, '0');

  const day = `${today.getDate()}`.padStart(2, '0');

  // string of YYYYMMDD for Zone serial
  const stringDate = [year, month, day].join('');

  // If following the YYYYMMDD## Serial format and the date is same as stringDate then increment the serial ID
  if (/^\d{10}$/.test(zone.soa.serial) && stringDate === zone.soa.serial.substring(0, 8)) {
    zone.soa.serial = `${stringDate}${(parseInt(zone.soa.serial.substr(9)) + 1).toString().padStart(2, '0')}`;
    return;
  }
  // Otherwise set the serial to YYMMDD01
  zone.soa.serial = `${stringDate}01`;
};

/**
 * Converts a BIND9 Zone object to a zonefile and writes it to disk
 * @param zone BIND9 Zone Object
 * @param domain
 */
export const saveZone = async (zone: ZONE, domain: string): Promise<void> => {
  await updateSOA(zone);
  const zoneString = await generateZoneFile(zone);
  return writeFile(`${ZONE_PATH}/${domain}`, zoneString);
};

export const addZone = async (domain: string, nsValue: string): Promise<BINDZONE> => {
  const zone: Zone = {
    $origin: domain,
    soa: {
      contact: `webmaster@${domain}`,
      serial: '0',
      refresh: '3600',
      retry: '600',
      expire: '604800',
      mttl: '1800'
    },
    ns: [{ host: '@', value: nsValue }]
  };

  await addZoneConfig(domain, bindConfig, { file: `/${ZONE_PATH}/${domain}` });

  // Create and save zone
  await saveZone(zone, domain);
  return { ...zone, zoneFile: domain };
};

interface RRParams {
  type: RRTypeENUM;
  RR: ValueRRRecordInput;
}

export const removeRR = (Zone: ZONE, { type, RR }: RRParams): void => {
  if (!Zone[type]) return;
  Zone[type] = Zone[type].filter(rr => JSON.stringify(rr) !== JSON.stringify(RR))
};

interface UpdateRRParams extends RRParams {
  NewRR: ValueRRRecordInput;
}

export const updateRR = (Zone: ZONE, { type, RR, NewRR }: UpdateRRParams): void => {
  if (!Zone[type]) throw new ApolloError(`Type doesn't exists on the Zone`, 'INVALID_TYPE');
  const ZoneRRIndex = Zone[type].indexOf(Zone[type].find(rr => JSON.stringify(rr) === JSON.stringify(RR)));
  Zone[type][ZoneRRIndex] = NewRR;
};

/**
 *
 * @param Zone BIND9 ZONE
 * @param param1
 */
export const NewRR = (Zone: ZONE, { type, RR }: RRParams): void => {
  if (!Zone[type]) Zone[type] = [RR];
  else Zone[type] = [...Zone[type], RR]
};
