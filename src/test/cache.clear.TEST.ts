import { expect, fs, FileSystemCache, basePath } from './common';

describe('clear', function () {
  it('clears all items (no namespace)', (done) => {
    const cache = new FileSystemCache({ basePath });
    const readdir = () => fs.readdirSync(cache.basePath);
    cache
      .set('foo', 'my-text')
      .then(() => cache.set('bar', { foo: 123 }))
      .then(() => {
        expect(readdir().length).to.equal(2);
        cache
          .clear()
          .then(() => {
            expect(fs.readdirSync(cache.basePath).length).to.equal(0);
            done();
          })
          .catch((err) => console.error(err));
      });
  });

  describe('with namespace', function () {
    it('clears all items without namespace - protects non-namespace items', (done) => {
      const cache1 = new FileSystemCache({ basePath });
      const cache2 = new FileSystemCache({ basePath, ns: 'My Namespace' });
      cache1
        .set('foo', 'my-text')
        .then(() => cache2.set('foo', 'my-text')) // Different value because of NS.
        .then(() => {
          expect(fs.readdirSync(cache1.basePath).length).to.equal(2);
          cache1
            .clear()
            .then((result) => {
              expect(fs.readdirSync(cache1.basePath).length).to.equal(1);
              done();
            })
            .catch((err) => console.error(err));
        });
    });

    it('clears all items with namespace - protects namespace items', (done) => {
      const cache1 = new FileSystemCache({ basePath });
      const cache2 = new FileSystemCache({ basePath, ns: 'My Namespace' });
      cache1
        .set('foo', 'my-text')
        .then(() => cache2.set('foo', 'my-text')) // Different value because of NS.
        .then(() => {
          expect(fs.readdirSync(cache1.basePath).length).to.equal(2);
          cache2
            .clear()
            .then((result) => {
              expect(fs.readdirSync(cache1.basePath).length).to.equal(1);
              done();
            })
            .catch((err) => console.error(err));
        });
    });
  });
});
