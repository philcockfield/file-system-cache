import { type t } from './types.t';

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
