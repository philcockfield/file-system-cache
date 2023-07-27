import { fs } from './libs';

export * from './util.crypto';
export * from './util.fs';
export * from './util.primitive';

/**
 * Retrieve a value from the given path.
 */
export async function getValueP(path: string, defaultValue?: any) {
  const exists = await fs.pathExists(path);
  if (!exists) return defaultValue;
  try {
    return toGetValue(await fs.readJson(path));
  } catch (error: any) {
    if (error.code === 'ENOENT') return defaultValue;
    if (error.message === 'Cache item has expired.') {
      fs.removeSync(path);
      return defaultValue;
    }
    throw new Error(`Failed to read cache value at: ${path}. ${error.message}`);
  }
}

/**
 * Format value structure.
 */
export function toGetValue(data: any) {
  if (isExpired(data)) throw new Error(`Cache item has expired.`);
  if (data.type === 'Date') return new Date(data.value);
  return data.value;
}

/**
 * Check's a cache item to see if it has expired.
 */
export function isExpired(data: any) {
  const timeElapsed = (new Date().getTime() - new Date(data.created).getTime()) / 1000;
  return timeElapsed > data.ttl && data.ttl > 0;
}
