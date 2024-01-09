import {
  BasePath,
  FileSystemCache,
  afterAll,
  beforeEach,
  deleteTmpDir,
  describe,
  expect,
  it,
} from './common';

describe('load', () => {
  const basePath = BasePath.random();
  beforeEach(() => deleteTmpDir(basePath));
  afterAll(() => deleteTmpDir(basePath));

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
