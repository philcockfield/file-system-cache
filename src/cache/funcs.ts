import { R, fs, fsPath, crypto } from './libs';

export const isNothing = (value: any) => R.isNil(value) || R.isEmpty(value);
export const isString = R.is(String);

export const toAbsolutePath = (path: string) => {
  return path.startsWith('.') ? fsPath.resolve(path) : path;
};

export const ensureString = R.curry((defaultValue, text) =>
  R.is(String, text) ? text : defaultValue,
);

export const compact = (input: string[]): string[] => {
  return input.flat().filter((value) => !R.isNil(value));
};

export const toStringArray = R.pipe(compact, R.map(R.toString));

export const isFileSync = (path: string) => {
  if (fs.existsSync(path)) return fs.lstatSync(path).isFile();
  return false;
};

export const readFileSync = (path: string) => {
  if (fs.existsSync(path)) {
    return fs.readFileSync(path).toString();
  }
};

export const existsP = (path: string) => {
  return fs.pathExists(path);
};

export const removeFileP = (path: string) => {
  return fs.remove(path);
};

export const filePathsP = async (basePath: string, ns: string): Promise<string[]> => {
  if (!(await fs.pathExists(basePath))) return [];
  return (await fs.readdir(basePath))
    .filter(Boolean)
    .filter((name) => (ns ? name.startsWith(ns) : true))
    .filter((name) => (!ns ? !name.includes('-') : true))
    .map((name) => `${basePath}/${name}`);
};

/**
 * Turns a set of values into a HEX hash code.
 * @param values: The set of values to hash.
 * @return {String} or undefined.
 */
export const hash = (...values: any[]) => {
  if (R.pipe(compact, R.isEmpty)(values)) {
    return undefined;
  }
  const resultHash = crypto.createHash('md5');
  const addValue = (value: any) => resultHash.update(value);
  const addValues = R.forEach(addValue);
  R.pipe(toStringArray, addValues)(values);
  return resultHash.digest('hex');
};

/**
 * Retrieve a value from the given path.
 */

export async function getValueP(path: string, defaultValue?: any) {
  const exists = await fs.pathExists(path);
  if (!exists) return defaultValue;
  try {
    return toGetValue(await fs.readJson(path));
  } catch (error: any) {
    if (error.code === 'ENOENT') return defaultValue;
    throw new Error(`Failed to read cache value at: ${path}. ${error.message}`);
  }
}

/**
 * Format value structure.
 */
export const toGetValue = (data: any) => {
  if (data.type === 'Date') return new Date(data.value);
  return data.value;
};

/**
 * Stringify a value into JSON.
 */
export const toJson = (value: any) => JSON.stringify({ value, type: R.type(value) });
