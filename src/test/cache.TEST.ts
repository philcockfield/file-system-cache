import { expect, fs, fsPath, FileSystemCache, Util, basePath } from './common';

const ABSOLUTE_BASE_PATH = fsPath.resolve(basePath);

describe('FileSystemCache', function () {
  describe('basePath', function () {
    it("has a default path of '/.cache'", () => {
      const cache = new FileSystemCache();
      expect(cache.basePath).to.equal(fsPath.resolve('./.cache'));
    });

    it("resolves the path if the path starts with ('.')", () => {
      const path = './test/foo';
      const cache = new FileSystemCache({ basePath: path });
      expect(cache.basePath).to.equal(fsPath.resolve(path));
    });

    it('uses the given absolute path', () => {
      const path = '/foo';
      const cache = new FileSystemCache({ basePath: path });
      expect(cache.basePath).to.equal(path);
    });

    it('throws if the basePath is a file', () => {
      let fn = () => {
        new FileSystemCache({ basePath: './README.md' });
      };
      expect(fn).to.throw();
    });
  });

  describe('ns (namespace)', function () {
    it('has no namespace by default', () => {
      expect(new FileSystemCache().ns).to.equal(undefined);
      expect(new FileSystemCache([] as any).ns).to.equal(undefined);
      expect(new FileSystemCache([null, undefined] as any).ns).to.equal(undefined);
    });

    it('creates a namespace hash with a single value', () => {
      const cache = new FileSystemCache({ ns: 'foo' });
      expect(cache.ns).to.equal(Util.hash('foo'));
    });

    it('creates a namespace hash with several values', () => {
      const cache = new FileSystemCache({ ns: ['foo', 123] });
      expect(cache.ns).to.equal(Util.hash('foo', 123));
    });
  });

  describe('path', function () {
    it('throws if no key is provided', () => {
      const cache = new FileSystemCache({ basePath });
      expect(() => (cache as any).path()).to.throw();
    });

    it('returns a path with no namespace', () => {
      const key = 'foo';
      const cache = new FileSystemCache({ basePath });
      const path = `${ABSOLUTE_BASE_PATH}/${Util.hash(key)}`;
      expect(cache.path(key)).to.equal(path);
    });

    it('returns a path with a namespace', () => {
      const key = 'foo';
      const ns = [1, 2];
      const cache = new FileSystemCache({ basePath, ns: ns });
      const path = `${ABSOLUTE_BASE_PATH}/${Util.hash(ns)}-${Util.hash(key)}`;
      expect(cache.path(key)).to.equal(path);
    });

    it('returns a path with a file extension', () => {
      const key = 'foo';
      const path = `${ABSOLUTE_BASE_PATH}/${Util.hash(key)}.styl`;
      let cache;
      cache = new FileSystemCache({ basePath, extension: 'styl' });
      expect(cache.path(key)).to.equal(path);

      cache = new FileSystemCache({ basePath, extension: '.styl' });
      expect(cache.path(key)).to.equal(path);
    });
  });

  describe('ensureBasePath()', function () {
    it('creates the base path', (done) => {
      const cache = new FileSystemCache({ basePath });
      expect(fs.existsSync(cache.basePath)).to.equal(false);
      expect(cache.basePathExists).not.to.equal(true);
      cache
        .ensureBasePath()
        .then(() => {
          expect(cache.basePathExists).to.equal(true);
          expect(fs.existsSync(cache.basePath)).to.equal(true);
          done();
        })
        .catch((err) => console.error(err));
    });
  });
});
