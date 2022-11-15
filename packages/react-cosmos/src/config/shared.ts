import { CosmosConfigInput } from 'react-cosmos-shared2/cosmosConfig';
import { requireModule } from '../shared/fs';

export function getCurrentDir() {
  return process.cwd();
}

export function requireConfigFile(
  cosmosConfigPath: string
): Promise<CosmosConfigInput> {
  return requireModule(cosmosConfigPath);
}
