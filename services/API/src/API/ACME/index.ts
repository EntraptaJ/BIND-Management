// API/src/API/SSL/index.tsx
import { Resolver, Mutation, Authorized, Arg, Ctx, ForbiddenError, Query, Root, Subscription } from 'type-graphql';
import { ACMEAccount, ACMEAccounts, NewACMEInput, GetLastUpdatedInput, UpdateACMEInput } from '../../Models/ACME';
import { Context } from '../Context';
import { generateDomains } from '../../Utils/ACME';
import { InstanceType } from 'typegoose';
import { generateCertificate } from '../../Utils/ACME/Certificate';

@Resolver(of => ACMEAccount)
export default class SSLResolver {
  @Mutation(returns => ACMEAccount)
  @Authorized()
  public async newACME(
    @Arg('input') { email, domainName, subDomains }: NewACMEInput,
    @Ctx() { user }: Context
  ): Promise<ACMEAccount> {
    const Zone = await user.checkUserZoneAuthorized(domainName, 'WRITE');
    if (!Zone) throw new ForbiddenError();

    const domains = generateDomains(subDomains, domainName);

    const ACMEAccount = await generateCertificate({ domains, domainName, user, Zone, email });

    return ACMEAccount.save();
  }

  @Authorized()
  @Subscription(type => ACMEAccount, { topics: ({ args, payload, context }) => args.domainName, nullable: false })
  public async ACME(
    @Root() Cert: InstanceType<ACMEAccount>,
    @Arg('domainName') domainName: string,
    @Ctx() { user }: Context
  ): Promise<ACMEAccount> {
    const ZoneFile = await user.checkUserZoneAuthorized(domainName, 'ADMIN');
    if (!ZoneFile) throw new ForbiddenError();
    return Cert.toObject();
  }

  @Query(returns => Date)
  @Authorized()
  public async getLastUpdated(
    @Arg('input', type => GetLastUpdatedInput) { domainName }: GetLastUpdatedInput,
    @Ctx() { user }: Context
  ): Promise<Date> {
    const Zone = await user.checkUserZoneAuthorized(domainName, 'ADMIN');
    if (!Zone) throw new ForbiddenError();

    const ACMEAccount = await ACMEAccounts.findOne({ domainName: domainName });

    if (!ACMEAccount || ACMEAccount.user === user._id) throw new ForbiddenError();
    return ACMEAccount.Certificate.updatedDate;
  }

  @Query(returns => ACMEAccount)
  @Authorized()
  public async ACMECert(
    @Arg('input', type => GetLastUpdatedInput) { domainName }: GetLastUpdatedInput,
    @Ctx() { user }: Context
  ): Promise<ACMEAccount> {
    const Zone = await user.checkUserZoneAuthorized(domainName, 'ADMIN');
    if (!Zone) throw new ForbiddenError();

    const ACMEAccount = await ACMEAccounts.findOne({ domainName: domainName });
    if (!ACMEAccount || ACMEAccount.user === user._id) throw new ForbiddenError();

    return ACMEAccount;
  }

  @Mutation(returns => ACMEAccount)
  @Authorized()
  public async updateACME(
    @Arg('input', type => UpdateACMEInput) { domainName, subDomains }: UpdateACMEInput,
    @Ctx() { user }: Context
  ): Promise<ACMEAccount> {
    const Zone = await user.checkUserZoneAuthorized(domainName, 'ADMIN');
    if (!Zone) throw new ForbiddenError();

    const domains = generateDomains(subDomains, domainName);

    const ACMEAccount = await generateCertificate({ domains, domainName, user, Zone });

    return ACMEAccount.save();
  }
}
