import { InterfaceType, Field } from 'type-graphql';

@InterfaceType()
export abstract class MutationResponse {
  @Field(type => Boolean)
  public success: boolean;
}
