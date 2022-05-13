import { FileSystemCache, FileSystemCacheOptions } from './FileSystemCache';

/**
 * Default entry function.
 */
export default (options?: FileSystemCacheOptions) => new FileSystemCache(options);
export { FileSystemCache };
