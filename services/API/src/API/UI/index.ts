// API/src/API/UI/index.ts
import { Resolver, Query, ForbiddenError, Arg, Mutation } from 'type-graphql';
import { Setting, setupCompleted, Settings, InitialSettingsInput } from '../../Models/Settings';
import { UserModel } from '../../Models/User';

const API_SECRET = process.env['API_SECRET'] || '1234567';

@Resolver(of => Setting)
export default class SettingsResolver {
  @Query(returns => Boolean)
  public async getSetupCompleted(@Arg('secret', { nullable: true }) secret: string): Promise<boolean> {
    if (secret !== API_SECRET) throw new ForbiddenError();
    return setupCompleted();
  }

  @Query(returns => Setting, { nullable: true })
  public async getSettings(@Arg('secret', { nullable: true }) secret: string): Promise<Setting> {
    if (secret !== API_SECRET) throw new ForbiddenError();
    return Settings.findOne({ id: 1 });
  }

  @Mutation(returns => Boolean)
  public async saveInitialSettings(@Arg('input', type => InitialSettingsInput) input: InitialSettingsInput): Promise<boolean> {
    const isSetup = await setupCompleted();
    if (isSetup) throw new ForbiddenError();
    const { username, password } = input;
    await Promise.all([
      UserModel.create({ username, password, role: ['User', 'Admin'] }),
      Settings.create({ id: 1, appName: input.appName, publicNSHostname: input.publicNSHostname })
    ]);
    return true;
  }
}
