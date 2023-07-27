export * from './const.hashes';

export const DEFAULTS = {
  ttl: 0, // NB: Never expires.
  encrypt: {
    algorithm: 'aes-256-ctr',
    ivLength: 16,
  },
} as const;
