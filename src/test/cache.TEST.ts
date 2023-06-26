import { FileSystemCache, Util, basePath, expect, fs, fsPath, type t } from './common';

const BASE_PATH = fsPath.resolve(basePath);

describe('FileSystemCache', () => {
  it('defaults', () => {
    const cache = new FileSystemCache();
    expect(cache.hash).to.eql('sha1');
    expect(cache.ttl).to.eql(0);
    expect(cache.ns).to.eql(undefined);
    expect(cache.extension).to.eql(undefined);
  });

  describe('basePath', () => {
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

  describe('ns (namespace)', () => {
    it('has no namespace by default', () => {
      expect(new FileSystemCache().ns).to.equal(undefined);
      expect(new FileSystemCache([] as any).ns).to.equal(undefined);
      expect(new FileSystemCache([null, undefined] as any).ns).to.equal(undefined);
    });

    it('creates a namespace hash with a single value', () => {
      const cache1 = new FileSystemCache({ ns: 'foo' });
      const cache2 = new FileSystemCache({ ns: 'foo', hash: 'sha256' });
      const cache3 = new FileSystemCache({ ns: 'foo', hash: 'sha512' });
      expect(cache1.ns).to.equal(Util.hash('sha1', 'foo'));
      expect(cache2.ns).to.equal(Util.hash('sha256', 'foo'));
      expect(cache3.ns).to.equal(Util.hash('sha512', 'foo'));
    });

    it('creates a namespace hash with several values', () => {
      const cache1 = new FileSystemCache({ ns: ['foo', 123] });
      const cache2 = new FileSystemCache({ ns: ['foo', 123], hash: 'sha256' });
      const cache3 = new FileSystemCache({ ns: ['foo', 123], hash: 'sha512' });
      expect(cache1.ns).to.equal(Util.hash('sha1', 'foo', 123));
      expect(cache2.ns).to.equal(Util.hash('sha256', 'foo', 123));
      expect(cache3.ns).to.equal(Util.hash('sha512', 'foo', 123));
    });
  });

  describe('path', () => {
    it('throws if no key is provided', () => {
      const cache = new FileSystemCache({ basePath });
      expect(() => (cache as any).path()).to.throw();
    });

    it('returns a path with no namespace', () => {
      const test = (hash: t.HashAlgorithm) => {
        const key = 'foo';
        const cache = new FileSystemCache({ basePath, hash });
        const path = `${BASE_PATH}/${Util.hash(hash, key)}`;
        expect(cache.path(key)).to.equal(path);
      };

      test('sha1');
      test('sha256');
      test('sha512');
    });

    it('returns a path with a namespace', () => {
      const test = (hash: t.HashAlgorithm) => {
        const key = 'foo';
        const ns = [1, 2];
        const cache = new FileSystemCache({ basePath, ns, hash });
        const path = `${BASE_PATH}/${Util.hash(hash, ns)}-${Util.hash(hash, key)}`;
        expect(cache.path(key)).to.equal(path);
      };

      test('sha1');
      test('sha256');
      test('sha512');
    });

    it('returns a path with a file extension', () => {
      const test = (hash: t.HashAlgorithm) => {
        const key = 'foo';
        const path = `${BASE_PATH}/${Util.hash(hash, key)}.styl`;
        let cache;
        cache = new FileSystemCache({ basePath, hash, extension: 'styl' });
        expect(cache.path(key)).to.equal(path);

        cache = new FileSystemCache({ basePath, hash, extension: '.styl' });
        expect(cache.path(key)).to.equal(path);
      };

      test('sha1');
      test('sha256');
      test('sha512');
    });
  });

  describe('ensureBasePath()', () => {
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
