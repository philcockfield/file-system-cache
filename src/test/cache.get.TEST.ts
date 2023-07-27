import { FileSystemCache, basePath, expect } from './common';

describe('get', function () {
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

  it('reads a stored values (various types)', (done) => {
    const cache1 = new FileSystemCache({ basePath });
    const cache2 = new FileSystemCache({ basePath });
    cache1.set('text', 'my value');
    cache1.set('number', 123);
    cache1.set('object', { foo: 456 }).then(() => {
      cache2
        .get('text')
        .then((result) => expect(result).to.equal('my value'))
        .then(() => {
          cache2.get('number').then((result) => expect(result).to.equal(123));
        })
        .then(() => {
          cache2.get('object').then((result) => expect(result).to.eql({ foo: 456 }));
        })
        .finally(() => done())
        .catch((err) => console.error(err));
    });
  });

  it('reads a stored date', (done) => {
    const cache1 = new FileSystemCache({ basePath });
    const cache2 = new FileSystemCache({ basePath });
    const now = new Date();
    cache1.set('date', now).then(() => {
      cache2
        .get('date')
        .then((result) => {
          expect(result).to.eql(now);
          done();
        })
        .catch((err) => console.error(err));
    });
  });

  describe('getSync', function () {
    it('reads a value synchonously', (done) => {
      const cache = new FileSystemCache({ basePath });
      const now = new Date();
      cache
        .set('date', now)
        .then(() => {
          expect(cache.getSync('date')).to.eql(now);
          done();
        })
        .catch((err) => console.error(err));
    });

    it('returns a default value synchonously', () => {
      const cache = new FileSystemCache({ basePath });
      const result = cache.getSync('my-sync-value', { myDefault: 123 });
      expect(result).to.eql({ myDefault: 123 });
    });
  });
});
