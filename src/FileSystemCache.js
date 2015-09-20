import R from "ramda";
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
}
