// API/src/Models/ResourceRecords.ts
import { registerEnumType, InterfaceType, Field, Int, ObjectType, InputType } from 'type-graphql';

export enum RRTypeENUMOLD {
  'a' = 'a',
  'txt' = 'txt',
  'ns' = 'ns',
  'aaaa' = 'aaaa',
  'cname' = 'cname',
  'dname' = 'dname',
  'ptr' = 'ptr'
}

export enum RRTypeENUM {
  'A' = 'a',
  'TXT' = 'txt',
  'NS' = 'ns',
  'AAAA' = 'aaaa',
  'CNAME' = 'cname',
  'DNAME' = 'dname',
  'PTR' = 'ptr'
}

export type ValueRRTypes = RRTypeENUM | 'A' | 'TXT' | 'NS' | 'AAAA' | 'CNAME' | 'DNAME' | 'PTR';

export enum UCRRTypeENUM {
  'A' = 'A',
  'TXT' = 'TXT',
  'NS' = 'NS',
  'AAAA' = 'AAAA',
  'CNAME' = 'CNAME',
  'DNAME' = 'DNAME',
  'PTR' = 'PTR'
}

export type UCRRTypes = RRTypeENUM | 'a' | 'txt' | 'ns' | 'aaaa' | 'cname' | 'dname' | 'ptr';

registerEnumType(RRTypeENUM, {
  name: 'ValueRRType',
  description: 'BIND9 Value Record RR Types'
});

@InterfaceType('ResourceRecord', {
  description: 'Base BIND9 Resource Record Class'
})
export abstract class IRR {
  @Field(type => String)
  public host: string;

  @Field(type => Int, { nullable: true })
  public ttl?: number;
}

@ObjectType('ValueRR', { description: 'Value Record Class', implements: IRR })
export class ValueRR implements IRR {
  public host: string;

  @Field(type => String)
  public value: string;

  @Field(type => Int, { nullable: true })
  public ttl?: number
}

@ObjectType('RRStuff', { description: 'Value Record Class', implements: IRR })
export class ValueRRType implements IRR {
  public host: string;

  @Field(type => String)
  public value: string;

  @Field(type => RRTypeENUM)
  public type: ValueRRTypes;

  @Field(type => Int, { nullable: true })
  public ttl?: number
}

@ObjectType('SRVRR', { description: 'SRV Record Class', implements: IRR })
export class SRVRR implements IRR {
  public host: string;

  @Field(type => String)
  public service: string;

  @Field(type => String)
  public protocol: string;

  @Field(type => Int)
  public priority: number;

  @Field(type => Int)
  public weight: number;

  @Field(type => Int)
  public port: number;

  @Field(type => String)
  public target: string;
}

@InputType('ValueRRRecordInput', { description: '' })
export class ValueRRRecordInput {
  @Field()
  public host: string;

  @Field()
  public value: string;

  @Field({
    nullable: true,
    description:
      '32 bit value. The Time to Live in seconds (range is 1 to 2147483647) and indicates how long the RR may be cached. The value zero indicates the data should not be cached.'
  })
  public ttl?: number;
}

@InputType('RRUpdateInput')
export class UpdateRRInput {
  @Field()
  public domainName: string;

  @Field(type => RRTypeENUM)
  public type: RRTypeENUM;

  @Field(type => ValueRRRecordInput)
  public oldRR: ValueRRRecordInput;

  @Field(type => ValueRRRecordInput, { nullable: true })
  public newRR?: ValueRRRecordInput;
}

@InputType('NewRR')
export class NewRRInput {
  @Field()
  public domainName: string;

  @Field(type => ValueRRRecordInput)
  public RR: ValueRRRecordInput;

  @Field(type => RRTypeENUM)
  public type: RRTypeENUM;
}
