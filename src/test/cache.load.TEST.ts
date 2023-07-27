import { FileSystemCache, basePath, expect } from './common';

describe('load', () => {
  it('loads no files', async () => {
    const cache = new FileSystemCache({ basePath });
    const result = await cache.load();
    expect(result.files).to.eql([]);
  });

  it('loads several files (no namespace)', async () => {
    const cache1 = new FileSystemCache({ basePath });
    const cache2 = new FileSystemCache({ basePath, ns: 'my-ns' });
    cache1.setSync('foo', 1);
    cache1.setSync('bar', 'two');
    cache2.set('yo', 'ns-value');

    const files = (await cache1.load()).files;
    expect(files.length).to.equal(2);
    expect(files[0].value).to.equal('two');
    expect(files[1].value).to.equal(1);
  });
});
