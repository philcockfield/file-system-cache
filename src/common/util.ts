import { pathExists, readJson, removeSync } from 'fs-extra/esm';
import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import { type t } from '../common.t';
import { R, crypto, fsPath } from './libs';

export const isNothing = (value: any) => R.isNil(value) || R.isEmpty(value);
export const isString = R.is(String);

export const toAbsolutePath = (path: string) => {
  return path.startsWith('.') ? fsPath.resolve(path) : path;
};

export const ensureString = (defaultValue: string, text?: string): string => {
  return typeof text === 'string' ? text : defaultValue;
};

export const compact = (input: any[]): string[] => {
  const flat = [].concat(...input);
  return flat.filter((value) => !R.isNil(value));
};

export const toStringArray = R.pipe(compact, R.map(R.toString));

export const isFileSync = (path: string) => {
  return fs.existsSync(path) ? fs.lstatSync(path).isFile() : false;
};

export const readFileSync = (path: string) => {
  return fs.existsSync(path) ? fs.readFileSync(path).toString() : undefined;
};

export const filePathsP = async (basePath: string, ns: string): Promise<string[]> => {
  if (!(await pathExists(basePath))) return [];
  return (await fsp.readdir(basePath))
    .filter(Boolean)
    .filter((name) => (ns ? name.startsWith(ns) : true))
    .filter((name) => (!ns ? !name.includes('-') : true))
    .map((name) => `${basePath}/${name}`);
};

/**
 * Turns a set of values into a HEX hash code.
 * @param values: The set of values to hash.
 */
export const hash = (algorithm: t.HashAlgorithm, ...values: any[]) => {
  if (R.pipe(compact, R.isEmpty)(values)) return undefined;
  const resultHash = crypto.createHash(algorithm);
  const addValue = (value: any) => resultHash.update(value);
  const addValues = R.forEach(addValue);
  R.pipe(toStringArray, addValues)(values);
  return resultHash.digest('hex');
};

export const hashExists = (algorithm: t.HashAlgorithm) => {
  return crypto.getHashes().includes(algorithm);
};

/**
 * Retrieve a value from the given path.
 */
export async function getValueP<T = any>(path: string, defaultValue?: T): Promise<T | undefined> {
  const exists = await pathExists(path);
  if (!exists) return defaultValue;
  try {
    return toGetValue(await readJson(path));
  } catch (error: any) {
    if (error.code === 'ENOENT') return defaultValue;
    if (error.message === 'Cache item has expired.') {
      removeSync(path);
      return defaultValue;
    }
    throw new Error(`Failed to read cache value at: ${path}. ${error.message}`);
  }
}

/**
 * Format value structure.
 */
export const toGetValue = <T = any>(data: StoredValue<T>): T | undefined => {
  if (isExpired(data)) return undefined;
  if (data.type === 'Date') return new Date(data.value as string) as T;
  return data.value;
};

interface StoredValue<T = any> {
  value: T;
  type: ReturnType<typeof R.type>;
  created: Date,
  ttl: number
}

/**
 * Stringify a value into JSON.
 */
export const toJson = (value: any, ttl: number) => {
  const obj: StoredValue = { value, type: R.type(value), created: new Date(), ttl };
  return JSON.stringify(obj);
}

/**
 * Check's a cache item to see if it has expired.
 */
export const isExpired = (data: any) => {
  const timeElapsed = (new Date().getTime() - new Date(data.created).getTime()) / 1000;
  return timeElapsed > data.ttl && data.ttl > 0;
};
