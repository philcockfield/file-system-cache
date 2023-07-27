import { type t } from './types.t';

import { DEFAULTS } from './const';
import { R, crypto } from './libs';
import { compact, toStringArray } from './util.primitive';

/**
 * Turns a set of values into a HEX hash code.
 * @param values: The set of values to hash.
 */
export function hash(algorithm: t.HashAlgorithm, ...values: any[]) {
  if (R.pipe(compact, R.isEmpty)(values)) return undefined;
  const resultHash = crypto.createHash(algorithm);
  const addValue = (value: any) => resultHash.update(value);
  const addValues = R.forEach(addValue);
  R.pipe(toStringArray, addValues)(values);
  return resultHash.digest('hex');
}

export function hashExists(algorithm: t.HashAlgorithm) {
  return crypto.getHashes().includes(algorithm);
}

/**
 * Encrypt the given data.
 */
export function encrypt(
  secret: string,
  data: crypto.BinaryLike,
  options: { algorithm?: string; ivLength?: number } = {},
): t.EncryptedFile {
  const { algorithm = DEFAULTS.encrypt.algorithm, ivLength = DEFAULTS.encrypt.ivLength } = options;
  const iv = crypto.randomBytes(ivLength); // Initialization vector.
  const cipher = crypto.createCipheriv(algorithm, secret, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  return {
    iv,
    data: encrypted,
    toString: () => `${iv.toString('hex')}:${encrypted.toString('hex')}`,
  };
}

/**
 * Decrypt the given data
 */
export function decrypt(
  secret: string,
  input: string | t.EncryptedFile,
  options: { algorithm?: string } = {},
): t.DecryptedFile {
  const text = typeof input === 'string' ? input : input.toString();
  const { algorithm = DEFAULTS.encrypt.algorithm } = options;

  const textParts = text.split(':');
  const iv = Buffer.from(textParts[0], 'hex');
  const encryptedText = Buffer.from(textParts[1], 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secret), iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);

  return {
    iv,
    data: decrypted,
    toString: () => decrypted.toString(),
  };
}
