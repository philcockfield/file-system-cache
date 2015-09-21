"use strict"
import R from "ramda";
import Promise from "bluebird";
import fs from "fs-extra";
import * as f from "./funcs";

const formatPath = R.pipe(f.ensureString("./.build"), f.toAbsolutePath);


/**
 * A cache that read/writes to a specific part of the file-system.
 */
export default class FileSystemCache {
  /**
   * Constructor.
   * @param options
   *            - basePath: The folder path to read/write to.
   *                        Default: "./build"
   *            - ns:       A single value, or array, that represents a
   *                        a unique namespace within which values for this
   *                        store are cached.
   */
  constructor({ basePath, ns } = {}) {
    this.basePath = formatPath(basePath);
    this.ns = f.hash(ns);
    if (f.isFileSync(this.basePath)) { throw new Error(`The basePath '${ this.basePath }' is a file. It should be a folder.`); }
  }

  /**
   * Generates the path to the cached files.
   * @param {string} key: The key of the cache item.
   * @param {options}
   *              - extension: A file extension to apply.
   * @return {string}.
   */
  path(key, options = {}) {
    if (f.isNothing(key)) { throw new Error(`Path requires a cache key.`); }
    let name = f.hash(key);
    if (this.ns) { name = `${ this.ns }-${ name }`; }
    if (R.is(String, options.extension)) {
      name = `${ name }.${ options.extension.replace(/^\./, "") }`;
    }
    return `${ this.basePath }/${ name }`;
  }


  /**
   * Ensure that the base path exists.
   */
  ensureBasePath() {
    return new Promise((resolve, reject) => {
      if (this.basePathExists) {
        resolve();
      } else {
        fs.ensureDir(this.basePath, (err) => {
          if (err) {
            reject(err);
          } else {
            this.basePathExists = true;
            resolve();
          }
        });
      }
    });
  }


  /**
   * Writes the given value to the file-system and memory cache.
   */
  set(key, value, options = {}) {
    const path = this.path(key, options);
    return new Promise((resolve, reject) => {
      this.ensureBasePath()
      .then(() => {
          fs.writeJson(path, { value: value }, (err) => {
            if (err) { reject(err); } else { resolve({ path }); }
          });
      })
      .catch(err => reject(err));
    });

  }
}
