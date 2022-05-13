import { FileSystemCache, FileSystemCacheOptions } from './cache';

/**
 * Default entry function.
 */
export default (options?: FileSystemCacheOptions) => new FileSystemCache(options);
export { FileSystemCache };
