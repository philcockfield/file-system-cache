import { FileSystemCache, basePath, expect, expectError, fs } from './common';

describe('save', function () {
  it('throws if items not valid', async () => {
    const cache = new FileSystemCache({ basePath });

    await expectError(() => cache.save([{}] as any));
    await expectError(() => cache.save([{ key: 1 }] as any));
    await expectError(() => cache.save([{ value: 'foo' }] as any));
  });

  it('resolves immediately if an empty array was passed', async () => {
    const cache = new FileSystemCache({ basePath });
    const res = await cache.save([]);
    expect(res.paths.length).to.eql(0);
  });

  it('saves several files', async () => {
    const cache = new FileSystemCache({ basePath });

    const payload = [
      { key: 'one', value: 'value-1' },
      null, // Should not break with null values.
      undefined,
      { key: 'two', value: { foo: 'value-2' } },
    ];

    const res = await cache.save(payload);
    const paths = res.paths;

    expect(paths.length).to.equal(2);
    expect(fs.existsSync(paths[0])).to.equal(true);
    expect(fs.existsSync(paths[1])).to.equal(true);
    expect(cache.getSync('one')).to.equal('value-1');
    expect(cache.getSync('two').foo).to.equal('value-2');
  });
});
