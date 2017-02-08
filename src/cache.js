import R from 'ramda';
import Promise from 'bluebird';
import fs from 'fs-extra';
import * as f from './funcs';

const formatPath = R.pipe(f.ensureString('./.cache'), f.toAbsolutePath);

const toGetValue = (data) => {
  const { type } = data;
  let { value } = data;
  if (type === 'Date') { value = new Date(value); }
  return value;
};

const getValueP = (path, defaultValue) => new Promise((resolve, reject) => {
  fs.readJson(path, (err, result) => {
    if (err) {
      if (err.code === 'ENOENT') {
        resolve(defaultValue);
      } else {
        reject(err);
      }
    } else {
      const value = toGetValue(result);
      resolve(value);
    }
  });
});

const toJson = (value) => JSON.stringify({ value, type: R.type(value) });



/**
 * A cache that read/writes to a specific part of the file-system.
 */
export default class FileSystemCache {
  /**
   * Constructor.
   * @param options
   *            - basePath:   The folder path to read/write to.
   *                          Default: './build'
   *            - ns:         A single value, or array, that represents a
   *                          a unique namespace within which values for this
   *                          store are cached.
   *            - extension:  An optional file-extension for paths.
   */
  constructor({ basePath, ns, extension } = {}) {
    this.basePath = formatPath(basePath);
    this.ns = f.hash(ns);
    if (f.isString(extension)) { this.extension = extension; }
    if (f.isFileSync(this.basePath)) {
      throw new Error(`The basePath '${ this.basePath }' is a file. It should be a folder.`);
    }
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
      name = `${ name }.${ this.extension.replace(/^\./, '') }`;
    }
    return `${ this.basePath }/${ name }`;
  }


  /**
   * Determines whether the file exists.
   * @param {string} key: The key of the cache item.
   * @return {Promise}
   */
  fileExists(key) { return f.existsP(this.path(key)); }


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
   * @param defaultValue: Optional. A default value to return if the value does not exist in cache.
   * @return {Promise} - File contents, or
   *                     undefined if the file does not exist.
   */
  get(key, defaultValue) { return getValueP(this.path(key), defaultValue); }


  /**
   * Gets the contents of the file with the given key.
   * @param {string} key: The key of the cache item.
   * @param defaultValue: Optional. A default value to return if the value does not exist in cache.
   * @return the cached value, or undefined.
   */
  getSync(key, defaultValue) {
    const path = this.path(key);
    return fs.existsSync(path)
      ? toGetValue(fs.readJsonSync(path))
      : defaultValue;
  }


  /**
   * Writes the given value to the file-system.
   * @param {string} key: The key of the cache item.
   * @param value: The value to write (Primitive or Object).
   * @return {Promise}
   */
  set(key, value) {
    const path = this.path(key);
    return new Promise((resolve, reject) => {
      this.ensureBasePath()
      .then(() => {
        fs.outputFile(path, toJson(value), (err) => {
          if (err) { reject(err); } else { resolve({ path }); }
        });
      })
      .catch(err => reject(err));
    });
  }


  /**
   * Writes the given value to the file-system and memory cache.
   * @param {string} key: The key of the cache item.
   * @param value: The value to write (Primitive or Object).
   * @return the cache.
   */
  setSync(key, value) {
    fs.outputFileSync(this.path(key), toJson(value));
    return this;
  }


  /**
   * Removes the item from the file-system.
   * @param {string} key: The key of the cache item.
   * @return {Promise}
   */
  remove(key) { return f.removeFileP(this.path(key)); }


  /**
   * Removes all items from the cache.
   * @return {Promise}
   */
  clear() {
    return new Promise((resolve, reject) => {
      f.filePathsP(this.basePath, this.ns)
        .then(paths => {
          const remove = (index) => {
            const path = paths[index];
            if (path) {
              return f.removeFileP(path)
                .then(() => remove(index + 1)) // <== RECURSION.
                .catch(err => reject(err));
            } else {
              return Promise.resolve(); // All files have been removed.
            }
          };
          return remove(0);
        })
        .catch(err => reject(err));
    });
  }


  /**
   * Saves several items to the cache in one operation.
   * @param {array} items: An array of objects of the form { key, value }.
   * @return {Promise}
   */
  save(items) {
    // Setup initial conditions.
    if (!R.is(Array, items)) { items = [items]; }
    const isValid = (item) => {
      if (!R.is(Object, item)) { return false; }
      return item.key && item.value;
    };
    items = R.pipe(
      R.reject(R.isNil),
      R.forEach((item) => {
        if (!isValid(item)) {
          throw new Error(`Save items not valid, must be an array of {key, value} objects.`);
        }
      })
    )(items);

    return new Promise((resolve, reject) => {
      // Don't continue if no items were passed.
      const response = { paths: [] };
      if (items.length === 0) {
        resolve(response);
        return;
      }

      // Recursively set each item to the file-system.
      const setValue = (index) => {
        const item = items[index];
        if (item) {
          this.set(item.key, item.value)
          .then(result => {
            response.paths[index] = result.path;
            setValue(index + 1); // <== RECURSION.
          })
          .catch(err => reject(err));
        } else {
          // No more items - done.
          resolve(response);
        }
      };
      setValue(0);
    });
  }


  /**
   * Loads all files within the cache's namespace.
   */
  load() {
    return new Promise((resolve, reject) => {
      f.filePathsP(this.basePath, this.ns)
        .then(paths => {
          // Bail out if there are no paths in the folder.
          const response = { files: [] };
          if (paths.length === 0) {
            resolve(response);
            return;
          }

          // Get each value.
          const getValue = (index) => {
            const path = paths[index];
            if (path) {
              getValueP(path)
              .then(result => {
                response.files[index] = { path, value: result };
                getValue(index + 1); // <== RECURSION.
              })
              .catch(err => reject(err));
            } else {
              // All paths have been loaded.
              resolve(response);
            }
          };
          getValue(0);
        })
        .catch(err => reject(err));
    });
  }
}
