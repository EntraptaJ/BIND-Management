// API/src/Models/BINDConfig/index.ts
import { Field, ObjectType } from 'type-graphql';
import { KeyConfig } from './Keys';
import { ZoneConfig } from './ZoneConfig';

export const bindConfig = process.env['NAMED_PATH'] || 'named.conf';

@ObjectType()
export class Config {
  @Field(type => [KeyConfig], {
    description: 'BIND9 Keys',
    nullable: 'itemsAndList'
  })
  public keys?: KeyConfig[];

  @Field(type => [ZoneConfig], { nullable: 'itemsAndList' })
  public zones?: ZoneConfig[];
}
