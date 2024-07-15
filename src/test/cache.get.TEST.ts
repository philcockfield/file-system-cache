import { BasePath, FileSystemCache, afterAll, beforeEach, deleteTmpDir, describe, expect, it } from './common';

describe('get', () => {
  const basePath = BasePath.random();
  beforeEach(() => deleteTmpDir(basePath));
  afterAll(() => deleteTmpDir(basePath));

  it('file not exist on the file-system', async () => {
    const cache = new FileSystemCache({ basePath });
    const res = await cache.get('foo');
    expect(res).to.eql(undefined);
  });

  it('gets a default value', async () => {
    const cache = new FileSystemCache({ basePath });
    return cache.get('foo', { myDefault: 123 }).then((result) => {
      expect(result).to.eql({ myDefault: 123 });
    });
  });

  it('reads a stored values (various types)', async () => {
    const cache1 = new FileSystemCache({ basePath });
    const cache2 = new FileSystemCache({ basePath });
    await cache1.set('text', 'my value');
    await cache1.set('number', 123);
    await cache1.set('object', { foo: 456 });

    expect(await cache2.get('text')).to.eql('my value');
    expect(await cache2.get('number')).to.eql(123);
    expect(await cache2.get('object')).to.eql({ foo: 456 });
  });

  it('reads a stored date', async () => {
    const cache1 = new FileSystemCache({ basePath });
    const cache2 = new FileSystemCache({ basePath });
    const now = new Date();
    await cache1.set('date', now);
    expect(await cache2.get('date')).to.eql(now);
  });

  describe('getSync', () => {
    it('reads a value synchonously', async () => {
      const cache = new FileSystemCache({ basePath });
      const now = new Date();

      await cache.set('date', now);
      expect(cache.getSync('date')).to.eql(now);
    });

    it('returns a default value synchonously', () => {
      const cache = new FileSystemCache({ basePath });
      const result = cache.getSync('my-sync-value', { myDefault: 123 });
      expect(result).to.eql({ myDefault: 123 });
    });
  });
});
