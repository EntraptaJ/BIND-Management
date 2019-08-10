import { prop, Typegoose, pre, instanceMethod, arrayProp, InstanceType } from 'typegoose';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { ForbiddenError, ObjectType, Field, InputType, registerEnumType } from 'type-graphql';
import { Zone } from './Zone';
import { getZoneFiles, loadZone } from '../Utils/BIND/Zones';
import { ApolloError } from 'apollo-server-koa';
import { ZONE } from 'ts-zone-file';

export type BINDZONE = Zone & ZONE;

export enum IPermissionENUM {
  READ,
  WRITE,
  ADMIN
}

export type IPermission = 'READ' | 'WRITE' | 'ADMIN' | IPermissionENUM;

export type Role = 'User' | 'Admin' | 'Guest';

export enum UserRoleEnum {
  'User' = 'User',
  'Admin' = 'Admin',
  'Guest' = 'Guest'
}

export type UserRole = Role | UserRoleEnum;

export enum UserAccessENUM {
  'READ' = 'READ',
  'WRITE' = 'WRITE',
  'ADMIN' = 'ADMIN'
}

export type UserAccess = 'READ' | 'WRITE' | 'ADMIN' | UserAccessENUM;

registerEnumType(UserRoleEnum, {
  name: 'UserRole'
});

registerEnumType(UserAccessENUM, {
  name: 'UserAccess'
});

class ZonePermission {
  @prop({ required: true })
  public domain: string;

  @arrayProp({ items: String, enum: UserAccessENUM })
  public permissions: UserAccess[];
}

@pre<User>('save', async function(next): Promise<void> {
  if (!this.isModified('password')) return next();
  if (this.isModified('password')) this.password = await hash(this.password, 10);
})
@ObjectType()
export class User extends Typegoose {
  @Field(type => String)
  public _id: string;

  @prop({ unique: true })
  @Field(type => String)
  public username: string;

  @prop()
  public password: string;

  @prop({ default: ['User'] })
  public role: Role[];

  @arrayProp({ items: ZonePermission, default: [] })
  public zonePermissions: ZonePermission[];

  @instanceMethod
  public async generateToken(this: User, plainText: string): Promise<string> {
    const valid = await compare(plainText, this.password);
    if (!valid) throw new ForbiddenError();
    return sign({ id: this._id }, 'SECRET', {
      expiresIn: '60d'
    });
  }

  @instanceMethod
  public async checkUserZoneAuthorized(
    this: InstanceType<User>,
    zoneName: string,
    role: UserAccess
  ): Promise<BINDZONE | undefined> {
    const ZonePermissions = this.zonePermissions.sort().reverse();
    const ZonePermission = ZonePermissions.find(({ domain }) => zoneName.includes(domain));
    if (!ZonePermission) return undefined;
    const hasRole = ZonePermission.permissions.includes(role);
    if (hasRole) return loadZone(zoneName);
    return undefined;
  }

  @instanceMethod
  public async getZones(this: InstanceType<User>): Promise<string[]> {
    const ZonePermissions = this.zonePermissions;
    return ZonePermissions.map(({ domain }) => domain);
  }

  @instanceMethod
  public async loadZones(this: InstanceType<User>): Promise<BINDZONE[]> {
    const AuthorizedZones = await this.getZones();
    return Promise.all(AuthorizedZones.map(async domain => loadZone(domain)));
  }

  @instanceMethod
  public async addZonePermission(this: InstanceType<User>, zoneName: string, permissions: UserAccess[]): Promise<void> {
    const ZoneFiles = await getZoneFiles();
    const ZoneFile = ZoneFiles.find(({ name }) => name === zoneName);
    if (!ZoneFile) throw new ApolloError('Zone not found', 'INVALID_ZONE');
    this.zonePermissions.push({ domain: ZoneFile.name, permissions });
    await this.save();
  }
}

@InputType()
export class NewUserInput {
  @Field()
  public username: string;

  @Field()
  public password: string;
}

export const UserModel = new User().getModelForClass(User);
