// API/src/API/Config/index.ts
import { Resolver, Query, Authorized } from 'type-graphql';
import { Config, bindConfig } from '../../Models/BINDConfig';
import { readFile } from 'fs-extra';
import { parseBINDConfig } from 'ts-zone-file';

@Resolver(of => Config)
export default class BINDConfigResolver {
  @Query(returns => Config, { description: 'Admin only. returns the named.conf for the NS server' })
  @Authorized(['Admin'])
  public async getConfig(): Promise<Config> {
    return parseBINDConfig((await readFile(bindConfig)).toString());
  }
}
