import { R, fs, Util } from './common';

export type FileSystemCacheOptions = {
  basePath?: string;
  ns?: any;
  extension?: string;
  ttl?: number;
};

/**
 * A cache that read/writes to a specific part of the file-system.
 */
export class FileSystemCache {
  basePath: string;
  ns?: any;
  extension?: string;
  basePathExists?: boolean;
  ttl: number;

  /**
   * Constructor.
   * @param options
   *            - basePath:   The folder path to read/write to.
   *                          Default: './build'
   *            - ns:         A single value, or array, that represents a
   *                          a unique namespace within which values for this
   *                          store are cached.
   *            - extension:  An optional file-extension for paths.
   *            - ttl:        The default time-to-live for cached values in seconds.
   *                          Default: 0 (never expires)
   */
  constructor(options: FileSystemCacheOptions = {}) {
    this.basePath = formatPath(options.basePath);
    this.ns = Util.hash(options.ns);
    this.ttl = (typeof options.ttl === 'undefined') ? 0 : options.ttl;
    if (Util.isString(options.extension)) this.extension = options.extension;
    if (Util.isFileSync(this.basePath)) {
      throw new Error(`The basePath '${this.basePath}' is a file. It should be a folder.`);
    }
  }

  /**
   * Generates the path to the cached files.
   * @param {string} key: The key of the cache item.
   */
  public path(key: string): string {
    if (Util.isNothing(key)) throw new Error(`Path requires a cache key.`);
    let name = Util.hash(key);
    if (this.ns) name = `${this.ns}-${name}`;
    if (this.extension) name = `${name}.${this.extension.replace(/^\./, '')}`;
    return `${this.basePath}/${name}`;
  }

  /**
   * Determines whether the file exists.
   * @param {string} key: The key of the cache item.
   */
  public fileExists(key: string) {
    return fs.pathExists(this.path(key));
  }

  /**
   * Ensure that the base path exists.
   */
  public async ensureBasePath() {
    if (!this.basePathExists) await fs.ensureDir(this.basePath);
    this.basePathExists = true;
  }

  /**
   * Gets the contents of the file with the given key.
   * @param {string} key: The key of the cache item.
   * @param defaultValue: Optional. A default value to return if the value does not exist in cache.
   * @return File contents, or
   *         undefined if the file does not exist.
   */
  public get(key: string, defaultValue?: any) {
    return Util.getValueP(this.path(key), defaultValue);
  }

  /**
   * Gets the contents of the file with the given key.
   * @param {string} key: The key of the cache item.
   * @param defaultValue: Optional. A default value to return if the value does not exist in cache.
   * @return the cached value, or undefined.
   */
  public getSync(key: string, defaultValue?: any) {
    const path = this.path(key);
    return fs.existsSync(path) ? Util.toGetValue(fs.readJsonSync(path)) : defaultValue;
  }

  /**
   * Writes the given value to the file-system.
   * @param {string} key: The key of the cache item.
   * @param value: The value to write (Primitive or Object).
   */
  public async set(key: string, value: any, ttl?: number) {
    const path = this.path(key);
    ttl = typeof ttl === 'number' ? ttl : this.ttl;
    await this.ensureBasePath();
    await fs.outputFile(path, Util.toJson(value, ttl));
    return { path };
  }

  /**
   * Writes the given value to the file-system and memory cache.
   * @param {string} key: The key of the cache item.
   * @param value: The value to write (Primitive or Object).
   * @return the cache.
   */
  public setSync(key: string, value: any, ttl?: number) {
    ttl = typeof ttl === 'number' ? ttl : this.ttl;
    fs.outputFileSync(this.path(key), Util.toJson(value, ttl));
    return this;
  }

  /**
   * Removes the item from the file-system.
   * @param {string} key: The key of the cache item.
   */
  public remove(key: string) {
    return fs.remove(this.path(key));
  }

  /**
   * Removes all items from the cache.
   */
  public async clear() {
    const paths = await Util.filePathsP(this.basePath, this.ns);
    await Promise.all(paths.map((path) => fs.remove(path)));
    console.groupEnd();
  }

  /**
   * Saves several items to the cache in one operation.
   * @param {array} items: An array of objects of the form { key, value }.
   */
  public async save(
    input: ({ key: string; value: any } | null | undefined)[],
  ): Promise<{ paths: string[] }> {
    type Item = { key: string; value: any };
    let items = (Array.isArray(input) ? input : [input]) as Item[];

    const isValid = (item: any) => {
      if (!R.is(Object, item)) return false;
      return item.key && item.value;
    };

    items = items.filter((item) => Boolean(item));
    items
      .filter((item) => !isValid(item))
      .forEach(() => {
        const err = `Save items not valid, must be an array of {key, value} objects.`;
        throw new Error(err);
      });

    if (items.length === 0) return { paths: [] };

    const paths = await Promise.all(
      items.map(async (item) => (await this.set(item.key, item.value)).path),
    );

    return { paths };
  }

  /**
   * Loads all files within the cache's namespace.
   */
  public async load(): Promise<{ files: { path: string; value: any }[] }> {
    const paths = await Util.filePathsP(this.basePath, this.ns);
    if (paths.length === 0) return { files: [] };
    const files = await Promise.all(
      paths.map(async (path) => ({ path, value: await Util.getValueP(path) })),
    );
    return { files };
  }
}

/**
 * Helpers
 */

function formatPath(path?: string) {
  path = Util.ensureString('./.cache', path);
  path = Util.toAbsolutePath(path);
  return path;
}
