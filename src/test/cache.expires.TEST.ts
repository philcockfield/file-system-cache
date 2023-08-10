import { FileSystemCache, basePath, expect } from './common';

function sleep(seconds: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}

describe('expires', async function () {
  this.timeout(3000);

  it('cache does NOT expire (various types)', (done) => {
    const cache1 = new FileSystemCache({ basePath, ttl: 10 });
    const cache2 = new FileSystemCache({ basePath, ttl: 10 });

    cache1.set('foo-1', 'bar-1');
    cache1.set('foo-2', 'bar-2', 0);
    cache1.set('foo-3', 'bar-3', 10).then(() => {
      cache2
        .get('foo')
        .then((result) => {
          sleep(1).then(() => expect(result).to.equal('bar'));
        })
        .then(() => {
          cache2.get('foo-2').then((result) => expect(result).to.equal('bar-2'));
          cache2.get('foo-3').then((result) => expect(result).to.equal('bar-3'));
        })
        .finally(() => done());
    });
  });

  it('cache DOES expires (various types)', (done) => {
    const cache1 = new FileSystemCache({ basePath, ttl: 0.3 });
    const cache2 = new FileSystemCache({ basePath, ttl: 0.3 });
    cache1.set('number', 123);
    cache1.set('object', { foo: 456 }, 1).then(() => {
      sleep(1).then(() => {
        cache2.get('number').then((result) => expect(result).to.equal(undefined));
        cache2
          .get('object')
          .then((result) => expect(result).to.equal(undefined))
          .finally(() => done())
          .catch((err) => console.error(err));
      });
    });
  });

  it('after expiring empty value is returned', async () => {
    const cache = new FileSystemCache({ basePath, ttl: 0.3 });
    await cache.set('my-number', 123);

    const res1 = await cache.getSync('my-number');
    await sleep(0.4);

    const res2 = await cache.getSync('my-number');
    expect(res1).to.eql(123);
    expect(res2).to.eql(undefined);
  });
});
