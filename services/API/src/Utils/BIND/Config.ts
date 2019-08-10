import { parseBINDConfig, generateConfig } from 'ts-zone-file';
import { readFile, writeFile } from 'fs-extra';

// API/src/Utils/BIND/Config.ts

interface AddZoneConfigArgs {
  file: string;
}

export const addZoneConfig = async (domain: string, configPath: string, { file }: AddZoneConfigArgs): Promise<void> => {
  const config = await parseBINDConfig((await readFile(configPath)).toString());

  if (!config) return;

  if (!config.zones) config.zones = [{ name: domain, file: file, type: 'master' }];
  else {
    if (config.zones.find(a => a.name === domain)) return;
    config.zones.push({ name: domain, file: file, type: 'master' });
  }
  const configString = await generateConfig(config);
  await writeFile(configPath, configString);
};
