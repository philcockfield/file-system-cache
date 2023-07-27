import { FileSystemCache, Util, basePath, expect } from './common';

describe('remove', function () {
  const setup = async () => {
    const cache = new FileSystemCache({ basePath });
    await cache.set('foo', 'my-text');
    return cache;
  };

  it('removes the file from the file-system', async () => {
    const cache = await setup();
    expect(Util.isFileSync(cache.path('foo'))).to.equal(true);

    await cache.remove('foo');
    expect(Util.isFileSync(cache.path('foo'))).to.equal(false);
  });

  it('does nothing if the key does not exist', async () => {
    const cache = await setup();

    await cache.remove('foobar');
    expect(Util.isFileSync(cache.path('foo'))).to.equal(true);
  });
});
