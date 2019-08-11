// API/src/Models/SSL.ts
import { ObjectType, Field, PubSubEngine, InputType } from 'type-graphql';
import { Typegoose, prop, arrayProp, Ref, InstanceType } from 'typegoose';
import { User } from './User';
import { EventEmitter } from 'events';

@ObjectType('Certificate')
export class Certificate {
  @Field()
  @prop()
  public updatedDate: Date;

  @Field()
  @prop()
  public certificate: string;

  @Field()
  @prop()
  public privKey: string;
}

@ObjectType('ACMEAccount')
export class ACMEAccount extends Typegoose {
  @Field()
  @prop()
  public email: string;

  @prop()
  public accountURL: string;

  @prop()
  public privKey: InstanceType<Buffer>;

  @Field()
  @prop()
  public domainName: string;

  @Field(type => [String])
  @arrayProp({ items: String })
  public domains: string[];

  @Field(type => Certificate)
  @prop()
  public Certificate: Certificate;

  @prop({ ref: User })
  public user: Ref<User>;
}

@ObjectType()
export class SSLCertificateRes {
  @Field()
  public certificate: string;

  @Field()
  public privKey: string;
}

@InputType()
export class NewACMEInput {
  @Field()
  public email: string;

  @Field(type => [String])
  public subDomains: string[];

  @Field()
  public domainName: string;
}

@InputType()
export class UpdateACMEInput {
  @Field()
  public domainName: string;

  @Field(type => [String], { nullable: 'items' })
  public subDomains: string[];
}

@InputType()
export class GetLastUpdatedInput {
  @Field()
  public domainName: string;
}

export const ACMEAccounts = new ACMEAccount().getModelForClass(ACMEAccount);

let id = 0;

export class ACMEPubSub extends PubSubEngine {
  public ee = new EventEmitter();

  public async publish(triggerName: string, cert: ACMEAccount): Promise<void> {
    this.ee.emit(triggerName, cert);
  }

  public async subscribe(triggerName: string, onMessage: (...args: any[]) => string): Promise<number> {
    this.ee.addListener(triggerName, onMessage);
    return id++;
  }

  public async unsubscribe(subId: number): Promise<void> {
    console.log('UnSubscribe');
  }
}

export const pubSub = new ACMEPubSub();
