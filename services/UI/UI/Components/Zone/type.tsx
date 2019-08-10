export interface ValueRRRecords {
  host: string;
  value: string;
  ttl?: number;
}

export enum ValueRRTypeENUM {
  'A' = 'A',
  'TXT' = 'TXT',
  'NS' = 'NS',
  'AAAA' = 'AAAA',
  'CNAME' = 'CNAME',
  'DNAME' = 'DNAME',
  'PTR' = 'PTR'
}

export type RRTypes = 'A' | 'TXT' | 'NS' | 'AAAA' | 'CNAME' | 'DNAME' | 'PTR';

export interface NewRRInput {
  domainName: string;
  type: RRTypes | string;
  RR: ValueRRRecords;
}

export interface UpdateRRInput {
  domainName: string;
  type: RRTypes | string;
  oldRR: ValueRRRecords;
  newRR?: ValueRRRecords;
}

export interface DeleteZoneInput {
  domainName: string;
}

type UserPermission = 'READ' | 'WRITE' | 'ADMIN';

export interface ValueRRTypeRecord extends ValueRRRecords {
  type: RRTypes;
}

export interface Zone {
  domain: string;
  a?: ValueRRRecords;
  ns: ValueRRRecords;
  userPermission: UserPermission;
  RRs?: ValueRRTypeRecord[];
}
