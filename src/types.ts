export type HashAlgorithm = 'sha1' | 'sha256';

export type FileSystemCacheOptions = {
  basePath?: string;
  ns?: any;
  extension?: string;
  ttl?: number;
  hash?: HashAlgorithm;
};
