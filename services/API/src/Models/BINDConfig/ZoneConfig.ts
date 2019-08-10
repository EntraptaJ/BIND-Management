// API/src/Models/BINDConfig.ts
import { Field, InterfaceType, ObjectType, registerEnumType } from 'type-graphql';
import { AUTODNSSEC, ZONETYPE, ZONETYPEENUM, AUTODNSSECENUM } from 'ts-zone-file';

registerEnumType(ZONETYPEENUM, {
  name: 'ZoneType',
  description: 'BIND9 Zone types'
});

registerEnumType(AUTODNSSECENUM, {
  name: 'autoDNSSEC',
  description: 'BIND9 Zone types'
});

@InterfaceType()
export abstract class BaseBINDZONEConfig {
  @Field(type => String)
  public name: string;

  @Field(type => ZONETYPEENUM)
  public type: ZONETYPE;

  @Field(type => String)
  public file: string;

  @Field(type => AUTODNSSECENUM, { nullable: true })
  public autoDNSSEC?: AUTODNSSEC;

  @Field(type => Boolean, { nullable: true })
  public inlineSigning?: boolean;

  @Field(type => String, { nullable: true })
  public keyDirectory?: string;

  @Field(type => [String], { nullable: 'itemsAndList' })
  public allowTransfer?: string[];

  @Field(type => [String], { nullable: 'itemsAndList' })
  public alsoNotify?: string[];

  @Field(type => Boolean, { nullable: true })
  public notify?: boolean;
}

@ObjectType({ implements: BaseBINDZONEConfig })
export class ZoneConfig implements BaseBINDZONEConfig {
  public name: string;

  public type: ZONETYPE;

  public file: string;
}
