import { BasePath, FileSystemCache, Sleep, afterAll, beforeEach, deleteTmpDir, describe, expect, it } from './common';

describe('expires', () => {
  const basePath = BasePath.random();
  beforeEach(() => deleteTmpDir(basePath));
  afterAll(() => deleteTmpDir(basePath));

  it('cache does NOT expire (various types)', async () => {
    const cache1 = new FileSystemCache({ basePath, ttl: 10 });
    const cache2 = new FileSystemCache({ basePath, ttl: 10 });

    await cache1.set('foo-1', 'bar-1');
    await cache1.set('foo-2', 'bar-2', 0);
    await cache1.set('foo-3', 'bar-3', 10);

    expect(await cache2.get('foo-1')).to.equal('bar-1');
    await Sleep.secs(1);

    expect(await cache2.get('foo-2')).to.equal('bar-2');
    expect(await cache2.get('foo-3')).to.equal('bar-3');
  });

  it('cache DOES expires (various types)', async () => {
    const cache1 = new FileSystemCache({ basePath, ttl: 0.3 });
    const cache2 = new FileSystemCache({ basePath, ttl: 0.3 });

    await cache1.set('number', 123);
    await cache1.set('object', { foo: 456 }, 1);

    await Sleep.secs(1);
    expect(await cache2.get('number')).to.eql(undefined);
    expect(await cache2.get('object')).to.eql(undefined);
  });

  it('after expiring empty value is returned', async () => {
    const cache = new FileSystemCache({ basePath, ttl: 0.3 });
    await cache.set('my-number', 123);

    const res1 = await cache.getSync('my-number');
    await Sleep.secs(0.4);

    const res2 = await cache.getSync('my-number');
    expect(res1).to.eql(123);
    expect(res2).to.eql(undefined);
  });
}, 3000);
