import CacheFs from '..';
import { expect, FileSystemCache } from './common';

describe('Module entry API', function () {
  it('creates an instance of [FileSystemCache]', () => {
    const cache = CacheFs();
    expect(cache).to.be.an.instanceof(FileSystemCache);
  });
});
