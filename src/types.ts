import type { HashAlgorithm } from './types.hashes';
export type { HashAlgorithm };

export type FileSystemCacheOptions = {
  basePath?: string;
  ns?: any;
  ttl?: number;
  hash?: HashAlgorithm;
  extension?: string;
};

export type EncryptedFile = {
  iv: Buffer;
  data: Buffer;
  toString(): string;
};

export type DecryptedFile = {
  iv: Buffer;
  data: Buffer;
  toString(): string;
};
