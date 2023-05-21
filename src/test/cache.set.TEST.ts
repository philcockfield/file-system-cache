import { expect, fs, Util, FileSystemCache, basePath } from './common';

describe('set', function () {
  it('saves a string to the file-system', async () => {
    const cache = new FileSystemCache({ basePath });
    const path = cache.path('foo');
    const value = 'my value';
    expect(fs.existsSync(path)).to.equal(false);

    const res = await cache.set('foo', value);
    expect(res.path).to.equal(path);
    expect(Util.readFileSync(path)).to.include('my value');
  });

  it('saves an object to the file-system', async () => {
    const cache = new FileSystemCache({ basePath });
    const value = { text: 'hello', number: 123 };

    const res = await cache.set('foo', value);

    const fileText = Util.readFileSync(res.path);
    expect(fileText).to.include('hello');
    expect(fileText).to.include('123');
  });

  it('setSync: saves a value synchonously', () => {
    const cache = new FileSystemCache({ basePath });
    const result = cache.setSync('foo', { text: 'sync' });
    expect(result).to.equal(cache);
    expect(cache.getSync('foo')).to.eql({ text: 'sync' });
  });
});
