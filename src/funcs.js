import R from "ramda";
import fs from "fs-extra";
import fsPath from "path";
import crypto from "crypto";
import Promise from "bluebird";


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

export const existsP = (path) => {
  return new Promise((resolve, reject) => {
    fs.exists(path, (exists) => resolve(exists));
  });
};

export const removeFileP = (path) => {
  return new Promise((resolve, reject) => {
    existsP(path)
    .then((exists) => {
      if (exists) {
        fs.remove(path, (err, result) => {
          if (err) { reject(err); } else { resolve(); }
        })
      } else {
        resolve();
      }
    })
  });
};


export const filePathsP = (basePath, ns) => {
  return new Promise((resolve, reject) => {
      existsP(basePath)
      .then(exists => {
          if (!exists) { resolve([]); return; }
          fs.readdir(basePath, (err, fileNames) => {
            if (err) {
              reject(err)
            } else {
              const paths = R.pipe(
                  compact,
                  R.filter((name) => ns ? name.startsWith(ns) : true),
                  R.filter((name) => !ns ? !R.contains("-")(name) : true),
                  R.map(name => `${ basePath }/${ name }`)
              )(fileNames);
              resolve(paths);
            }
          });
      });
  });
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
