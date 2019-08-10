// API/src/API/Zone/index.ts
import {
  Resolver,
  Query,
  Authorized,
  Ctx,
  InputType,
  Field,
  Mutation,
  Arg,
  FieldResolver,
  Root,
  UnauthorizedError,
  ForbiddenError,
  ObjectType
} from 'type-graphql';
import { Zone, DeleteZoneInput, ZONE_PATH } from '../../Models/Zone';
import { Context } from '../Context';
import { getZoneFiles, addZone, saveZone, removeRR, updateRR } from '../../Utils/BIND/Zones';
import { ApolloError } from 'apollo-server-koa';
import { UserAccessENUM, UserAccess } from '../../Models/User';
import { ValueRRType, RRTypeENUM, ValueRR, ValueRRTypes, UpdateRRInput, NewRRInput } from '../../Models/ResourceRecords';
import { restartBIND } from '../../Utils/Docker/NS';
import { MutationResponse } from '../Mutations';
import { remove } from 'fs-extra';
import { getNSHostname } from '../../Models/Settings';

@InputType('NewZone')
class NewZoneInput {
  @Field()
  public domainName: string;
  /* 
  @Field(type => ValueRRRecordInput)
  public A: ValueRRRecordInput; */
}

const NSContainer = process.env['NS'] || 'NS1';

@ObjectType({ implements: MutationResponse })
class DeleteZoneMutationResponse implements MutationResponse {
  public success: boolean;
}

@Resolver(of => Zone)
export default class ZoneResolver {
  @Query(returns => [Zone], { description: 'Returns all Zones the user has access to' })
  @Authorized()
  public async Zones(@Ctx() { user }: Context): Promise<Zone[]> {
    return user.loadZones();
  }

  @Query(returns => Zone)
  @Authorized()
  public async Zone(@Arg('zoneName') zoneName: string, @Ctx() { user }: Context): Promise<Zone> {
    const Zone = await user.checkUserZoneAuthorized(zoneName, 'READ');
    if (!Zone) throw new UnauthorizedError();
    else return Zone;
  }

  @Mutation(returns => Zone, { description: 'Creates a new zone under the users account.' })
  @Authorized()
  public async newZone(@Ctx() { user }: Context, @Arg('input') input: NewZoneInput): Promise<Zone> {
    const ZoneFiles = await getZoneFiles();
    if (ZoneFiles.find(({ name }) => name === input.domainName)) throw new ApolloError('Zone already exists', 'ZONE_EXISTS');

    const Zone = await addZone(input.domainName, await getNSHostname());
    await user.addZonePermission(input.domainName, ['READ', 'WRITE', 'ADMIN']);

    await restartBIND(NSContainer);
    return Zone;
  }

  @Mutation(returns => Zone, { description: 'Adds a new value RR' })
  @Authorized()
  public async newRR(
    @Arg('input', type => NewRRInput) { domainName, type, RR }: NewRRInput,
    @Ctx() { user }: Context
  ): Promise<Zone> {
    const ZoneFile = await user.checkUserZoneAuthorized(domainName, 'WRITE');
    if (!ZoneFile) throw new ForbiddenError();

    if (!ZoneFile[type]) ZoneFile[type] = [RR];
    else ZoneFile[type].push(RR);

    await saveZone(ZoneFile, ZoneFile.zoneFile);

    await restartBIND(NSContainer);

    return ZoneFile;
  }

  @Mutation(returns => Zone, { description: 'Updates an RR Record' })
  @Authorized()
  public async updateRR(@Arg('input', type => UpdateRRInput) input: UpdateRRInput, @Ctx() { user }: Context): Promise<Zone> {
    const ZoneFile = await user.checkUserZoneAuthorized(input.domainName, 'WRITE');
    if (!ZoneFile) throw new UnauthorizedError();
    if (input.oldRR && !input.newRR) removeRR(ZoneFile, { type: input.type, RR: input.oldRR });
    else if (input.oldRR && input.newRR) updateRR(ZoneFile, { type: input.type, RR: input.oldRR, NewRR: input.newRR });
    await saveZone(ZoneFile, ZoneFile.zoneFile);
    await restartBIND(NSContainer);

    return ZoneFile;
  }

  @Mutation(returns => DeleteZoneMutationResponse)
  @Authorized()
  public async deleteZone(
    @Arg('input', type => DeleteZoneInput) { domainName }: DeleteZoneInput,
    @Ctx() { user }: Context
  ): Promise<DeleteZoneMutationResponse> {
    const ZonePermissions = user.zonePermissions.sort().reverse();
    const ZonePermission = ZonePermissions.find(({ domain }) => domainName.includes(domain));
    if (!ZonePermission || !ZonePermission.permissions.includes('ADMIN')) throw new ForbiddenError();
    user.zonePermissions = [...ZonePermissions.filter(permissions => permissions !== ZonePermission)];
    remove(`${ZONE_PATH}/${domainName}`);
    await user.save();

    return { success: true };
  }

  @FieldResolver(returns => UserAccessENUM)
  @Authorized()
  public async userPermission(@Root() zone: Zone, @Ctx() { user }: Context): Promise<UserAccess> {
    const { permissions } = user.zonePermissions.find(({ domain }) => domain === zone.zoneFile);
    if (permissions.includes('ADMIN')) return 'ADMIN';
    else if (permissions.includes('WRITE')) return 'WRITE';
    else if (permissions.includes('READ')) return 'READ';
    else throw new ApolloError('Access level unknown', 'UNKNOWN_ACCESS');
  }

  @FieldResolver(returns => String)
  public async domain(@Root() domain: Zone): Promise<string> {
    return domain.zoneFile;
  }

  @FieldResolver(returns => [ValueRRType])
  public async RRs(@Root() domain: Zone): Promise<ValueRRType[]> {
    let RRs: ValueRRType[] = [];
    for (const [type, arr] of Object.entries(domain)) {
      if (RRTypeENUM[type.toUpperCase()]) {
        const RRStuff = arr as ValueRR[];
        RRs = [...RRs, ...RRStuff.map(r => ({ ...r, type: type as ValueRRTypes }))];
      }
    }

    return RRs;
  }
}
