import { R } from './libs';

export const toStringArray = R.pipe(compact, R.map(R.toString));
export const isNothing = (value: any) => R.isNil(value) || R.isEmpty(value);
export const isString = R.is(String);

export function compact(input: any[]): string[] {
  const flat = [].concat(...input);
  return flat.filter((value) => !R.isNil(value));
}

export function ensureString(defaultValue: string, text?: string): string {
  return typeof text === 'string' ? text : defaultValue;
}

/**
 * Stringify a value into JSON.
 */
export function toJson(value: any, ttl: number) {
  return JSON.stringify({
    value,
    type: R.type(value),
    created: new Date(),
    ttl,
  });
}
