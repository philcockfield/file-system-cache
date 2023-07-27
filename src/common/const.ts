export * from './const.hashes';

export const DEFAULTS = {
  encrypt: {
    algorithm: 'aes-256-ctr',
    ivLength: 16,
  },
} as const;
