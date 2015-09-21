import R from "ramda";
import fs from "fs-extra";
import fsPath from "path";
import crypto from "crypto";


export const compact = R.pipe(R.flatten, R.reject(R.isNil));
export const toStringArray = R.pipe(compact, R.map(R.toString));
export const ensureString = R.curry((defaultValue, text) => R.is(String, text) ? text : defaultValue);
export const toAbsolutePath = (path) => path.startsWith(".") ? fsPath.resolve(path) : path;
export const isNothing = (value) => R.isNil(value) || R.isEmpty(value);
export const isString = R.is(String);


export const isFileSync = (path) => {
  if (fs.existsSync(path)) {
    return fs.lstatSync(path).isFile();
  }
  return false;
};

export const readFileSync = (path) => {
  if (fs.existsSync(path)) {
    return fs.readFileSync(path).toString()
  }
};

/**
 * Turns a set of values into a HEX hash code.
 * @param values: The set of values to hash.
 */
export const hash = (...values) => {
  if (R.pipe(compact, R.isEmpty)(values)) { return; }
  const hash = crypto.createHash("md5")
  const addValue = value => hash.update(value);
  const addValues = R.forEach(addValue);
  R.pipe(
    toStringArray,
    addValues
  )(values)
  return hash.digest("hex")
};
