export type HashAlgorithm = 'sha1' | 'sha256' | 'sha512';

export type FileSystemCacheOptions = {
  basePath?: string;
  ns?: any;
  ttl?: number;
  hash?: HashAlgorithm;
  extension?: string;
};
