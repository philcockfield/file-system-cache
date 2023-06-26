import { type t } from './common';
import { FileSystemCache } from './FileSystemCache';

/**
 * Default entry function.
 */
export default (options?: t.FileSystemCacheOptions) => new FileSystemCache(options);
export { FileSystemCache, FileSystemCache as Cache };
