// API/src/Models/BINDConfig/Keys.ts
import { TSIGALGORITHM, TSIGALGORITHMENUM } from 'ts-zone-file';
import { Field, InterfaceType, ObjectType, registerEnumType } from 'type-graphql';

registerEnumType(TSIGALGORITHMENUM, {
  name: 'TSIGALGORITHM',
  description: 'BIND9 TSIG Algroithms'
});

@InterfaceType('Key')
abstract class IKey {
  @Field(type => String)
  public name: string;

  @Field(type => String)
  public secret: string;

  @Field(type => TSIGALGORITHMENUM)
  public algorithm: TSIGALGORITHM;
}

@ObjectType({ implements: IKey })
export class KeyConfig implements IKey {
  public name: string;

  public secret: string;

  public algorithm: TSIGALGORITHM;
}
