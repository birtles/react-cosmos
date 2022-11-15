import path from 'path';
import { CosmosConfigInput } from 'react-cosmos-shared2/cosmosConfig';
import { createCosmosConfig } from './createCosmosConfig';
import { requireConfigFile } from './shared';

export async function getCosmosConfigAtPath(cosmosConfigPath: string) {
  const cosmosConfigInput = await requireConfigFile(cosmosConfigPath);
  const rootDir = deriveRootDir(cosmosConfigPath, cosmosConfigInput);
  return createCosmosConfig(rootDir, cosmosConfigInput);
}

function deriveRootDir(
  cosmosConfigPath: string,
  { rootDir }: CosmosConfigInput
) {
  const configDir = path.dirname(cosmosConfigPath);
  return rootDir ? path.resolve(configDir, rootDir) : configDir;
}
