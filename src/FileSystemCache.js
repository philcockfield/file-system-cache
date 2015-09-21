"use strict"
import R from "ramda";
import Promise from "bluebird";
import fs from "fs-extra";
import * as f from "./funcs";

const formatPath = R.pipe(f.ensureString("./.build"), f.toAbsolutePath);
const PRIVATE_REMOVE_PATH = Symbol("removePath");
const PRIVATE_FILE_EXISTS_PATH = Symbol("existsPath");


/**
 * A cache that read/writes to a specific part of the file-system.
 */
export default class FileSystemCache {
  /**
   * Constructor.
   * @param options
   *            - basePath:   The folder path to read/write to.
   *                          Default: "./build"
   *            - ns:         A single value, or array, that represents a
   *                          a unique namespace within which values for this
   *                          store are cached.
   *            - extension:  An optional file-extension for paths.
   */
  constructor({ basePath, ns, extension } = {}) {
    this.basePath = formatPath(basePath);
    this.ns = f.hash(ns);
    if (f.isString(extension)) { this.extension = extension; }
    if (f.isFileSync(this.basePath)) { throw new Error(`The basePath '${ this.basePath }' is a file. It should be a folder.`); }
  }

  /**
   * Generates the path to the cached files.
   * @param {string} key: The key of the cache item.
   * @return {string}.
   */
  path(key) {
    if (f.isNothing(key)) { throw new Error(`Path requires a cache key.`); }
    let name = f.hash(key);
    if (this.ns) { name = `${ this.ns }-${ name }`; }
    if (this.extension) {
      name = `${ name }.${ this.extension.replace(/^\./, "") }`;
    }
    return `${ this.basePath }/${ name }`;
  }


  /**
   * Determines whether the file exists.
   * @param {string} key: The key of the cache item.
   * @return {Promise}
   */
  fileExists(key) { return this[PRIVATE_FILE_EXISTS_PATH](this.path(key)); }


  [PRIVATE_FILE_EXISTS_PATH](path) {
    return new Promise((resolve, reject) => {
      fs.exists(path, (exists) => resolve(exists));
    });
  }



  /**
   * Ensure that the base path exists.
   * @return {Promise}
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
   * Gets the contents of the file with the given key.
   * @param {string} key: The key of the cache item.
   * @return {Promise} - File contents, or
   *                     Undefined if the file does not exist.
   */
  get(key) {
    return new Promise((resolve, reject) => {
          const path = this.path(key);
          fs.readJson(path, (err, result) => {
            if (err) {
              if (err.code === "ENOENT") {
                resolve(undefined);
              } else {
                reject(err);
              }
            } else {
              let { value, type } = result;
              if (type === "Date") { value = new Date(value); }
              resolve(value);
            }
          });
    });
  }


  /**
   * Writes the given value to the file-system and memory cache.
   * @param {string} key: The key of the cache item.
   * @param value: The value to write (Primitive or Object).
   * @return {Promise}
   */
  set(key, value) {
    const path = this.path(key);
    return new Promise((resolve, reject) => {
      this.ensureBasePath()
      .then(() => {
          const json = {
            value,
            type: R.type(value)
          }
          fs.outputFile(path, JSON.stringify(json), (err) => {
            if (err) { reject(err); } else { resolve({ path }); }
          });
      })
      .catch(err => reject(err));
    });
  }


  [PRIVATE_REMOVE_PATH](path) {
    return new Promise((resolve, reject) => {
      this[PRIVATE_FILE_EXISTS_PATH](path)
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
  }

  /**
   * Removes the item from the file-system.
   * @param {string} key: The key of the cache item.
   * @return {Promise}
   */
  remove(key) { return this[PRIVATE_REMOVE_PATH](this.path(key)); }
}
