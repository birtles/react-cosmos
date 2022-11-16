import path from 'path';
import { resolveModule } from '../../../config/resolveModule';
import { CosmosConfig } from '../../../config/shared';
import { fileExists } from '../../../shared/fs';

type WebpackCosmosConfig = {
  configPath: null | string;
  overridePath: null | string;
  includeHashInOutputFilename: boolean;
  hotReload: boolean;
  // Related to, but separate from, the 'hotReload' option.
  // Matches to the 'reload' config option in webpack-hot-middleware.
  // If false, location reload will *not* occur when webpack gets stuck updating code.
  reloadOnFail: boolean;
};

type WebpackCosmosConfigInput = Partial<WebpackCosmosConfig>;

export function createWebpackCosmosConfig(
  cosmosConfig: CosmosConfig
): WebpackCosmosConfig {
  const { rootDir } = cosmosConfig;
  const configInput = (cosmosConfig.webpack || {}) as WebpackCosmosConfigInput;

  return {
    configPath: getWebpackConfigPath(configInput, rootDir),
    overridePath: getWebpackOverridePath(configInput, rootDir),
    includeHashInOutputFilename: getIncludeHashInOutputFilename(configInput),
    hotReload: getHotReload(configInput),
    reloadOnFail: getReloadOnFail(configInput),
  };
}

function getWebpackConfigPath(
  { configPath }: WebpackCosmosConfigInput,
  rootDir: string
) {
  if (typeof configPath === 'undefined') {
    // Look for a Common JS config file first, for backwards compatibility
    const cjsPath = resolveModule(rootDir, 'webpack.config.js');
    // If it doesn't exist, look for an ESM version, but if that too doesn't
    // exist, return the (non-existent) path to the Common JS version since that
    // will probably produce a less-confusing error message.
    if (!fileExists(cjsPath)) {
      const mjsPath = resolveModule(rootDir, 'webpack.config.mjs');
      if (fileExists(mjsPath)) {
        return mjsPath;
      }
    }
    return cjsPath;
  }

  // User can choose to prevent automatical use of an existing webpack.config.js
  // file (relative to the root dir) by setting configPath to null
  if (!configPath) {
    return null;
  }

  const absPath = resolveModule(rootDir, configPath);
  if (!fileExists(absPath)) {
    const relPath = path.relative(process.cwd(), absPath);
    throw new Error(`webpack config not found at path: ${relPath}`);
  }

  return absPath;
}

function getWebpackOverridePath(
  { overridePath }: WebpackCosmosConfigInput,
  rootDir: string
) {
  if (typeof overridePath === 'undefined') {
    // TODO: Look up a .mjs version like we do for getWebpackConfigPath
    return resolveModule(rootDir, 'webpack.override.js');
  }

  // User can choose to prevent automatical use of an existing webpack.override.js
  // file (relative to the root dir) by setting overridePath to null
  if (!overridePath) {
    return null;
  }

  const absPath = resolveModule(rootDir, overridePath);
  if (!fileExists(absPath)) {
    const relPath = path.relative(process.cwd(), absPath);
    throw new Error(`webpack override module not found at path: ${relPath}`);
  }

  return absPath;
}

// Default value is False to not break backwards compatibility
// In future releases it's better to mark this as @deprecated and set
// output.filename to "[name].[contenthash].js" by default
function getIncludeHashInOutputFilename({
  includeHashInOutputFilename = false,
}: WebpackCosmosConfigInput) {
  return includeHashInOutputFilename;
}

function getHotReload({ hotReload = true }: WebpackCosmosConfigInput) {
  return hotReload;
}

function getReloadOnFail({ reloadOnFail = true }: WebpackCosmosConfigInput) {
  return reloadOnFail;
}
