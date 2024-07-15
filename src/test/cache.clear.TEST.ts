import * as fs from 'node:fs';

import { BasePath, FileSystemCache, afterAll, beforeEach, deleteTmpDir, describe, expect, it } from './common';

describe('clear', () => {
  const basePath = BasePath.random();
  beforeEach(() => deleteTmpDir(basePath));
  afterAll(() => deleteTmpDir(basePath));

  it('clears all items (no namespace)', async () => {
    const cache = new FileSystemCache({ basePath });
    const readdir = () => fs.readdirSync(cache.basePath);

    await cache.set('foo', 'my-text');
    await cache.set('bar', { foo: 123 });
    expect(readdir().length).to.equal(2);

    await cache.clear();
    expect(fs.readdirSync(cache.basePath).length).to.equal(0);
  });

  describe('with namespace', () => {
    it('clears all items without namespace - protects non-namespace items', async () => {
      const cache1 = new FileSystemCache({ basePath });
      const cache2 = new FileSystemCache({ basePath, ns: 'My Namespace' });

      await cache1.set('foo', 'my-text');
      await cache2.set('foo', 'my-text'); // Different value because of NS.
      expect(fs.readdirSync(cache1.basePath).length).to.equal(2);

      await cache1.clear();
      expect(fs.readdirSync(cache1.basePath).length).to.equal(1);
    });

    it('clears all items with namespace - protects namespace items', async () => {
      const cache1 = new FileSystemCache({ basePath });
      const cache2 = new FileSystemCache({ basePath, ns: 'My Namespace' });

      await cache1.set('foo', 'my-text');
      await cache2.set('foo', 'my-text'); // Different value because of NS.
      expect(fs.readdirSync(cache1.basePath).length).to.equal(2);

      await cache2.clear();
      expect(fs.readdirSync(cache1.basePath).length).to.equal(1);
    });
  });
});
