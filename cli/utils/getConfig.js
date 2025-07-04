import { join } from 'node:path';
import { buildConfig } from '../../dsl/index.js';

export const getConfig = async (options) => {
    console.log(options);
  const configPath = join(process.cwd(), options.config);
  return await buildConfig(configPath);
};
