import CacheFs from '..';
import { FileSystemCache, describe, expect, it } from './common';

describe('Module entry API', () => {
  it('creates an instance of [FileSystemCache]', () => {
    const cache = CacheFs();
    expect(cache).to.be.an.instanceof(FileSystemCache);
  });
});
