// API/src/Models/Zone.ts
import { ObjectType, Field, Authorized, InputType } from 'type-graphql';
import { ValueRR, SRVRR, ValueRRType } from './ResourceRecords';
import { UserAccess, UserAccessENUM } from './User';

export const ZONE_PATH = process.env['ZONE_PATH'] || 'zones';

@ObjectType('SOA', {
  description:
    'Start of Authority. Defines the zone name, an e-mail contact and various time and refresh values applicable to the zone. http://www.zytrax.com/books/dns/ch8/soa.html'
})
export class SOA {
  @Field(type => String)
  public contact: string;

  @Field(type => String)
  public serial: string;

  @Field(type => String)
  public refresh: string;

  @Field(type => String)
  public retry: string;

  @Field(type => String)
  public expire: string;

  @Field(type => String)
  public mttl: string;
}

@ObjectType('Zone', { description: 'BIND9 ZoneFile http://www.zytrax.com/books/dns/ch8/' })
export class Zone {
  @Field({ name: 'origin', description: 'BIND9 ZoneFile Origin' })
  public $origin: string;

  @Field(type => SOA, {
    name: 'SOA',
    description:
      'Start of Authority. Defines the zone name, an e-mail contact and various time and refresh values applicable to the zone. http://www.zytrax.com/books/dns/ch8/soa.html'
  })
  public soa: SOA;

  @Field(type => [ValueRR], { name: 'NS' })
  public ns: ValueRR[];

  @Field(type => [ValueRRType])
  public RRs?: ValueRRType[];

  @Field(type => [ValueRR], {
    name: 'A',
    nullable: 'itemsAndList',
    description: 'IPv4 Address record. An IPv4 address for a host.  http://www.zytrax.com/books/dns/ch8/a.html'
  })
  public a?: ValueRR[];

  @Field(type => [ValueRR], { nullable: 'itemsAndList', name: 'TXT' })
  public txt?: ValueRR[];

  @Field(type => [SRVRR], {
    name: 'SRV',
    nullable: 'itemsAndList',
    description:
      'Defines services available in the zone, for example, ldap, http, sip etc.. Allows for discovery of domain servers providing specific services.. http://www.zytrax.com/books/dns/ch8/srv.html'
  })
  public srv?: SRVRR[];

  @Field({ description: 'Domain name for the ZoneFile' })
  public domain?: string;

  @Field({ description: 'Admin Authorization only' })
  @Authorized(['Admin'])
  public zoneFile?: string;

  @Field(type => UserAccessENUM)
  @Authorized()
  public userPermission?: UserAccess;
}

@InputType()
export class DeleteZoneInput {
  @Field()
  public domainName: string;
}
