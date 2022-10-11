import { expect, Util } from './common';

describe('common/util', () => {
  it('compact', () => {
    const input = ['one', undefined, ['two', undefined], [undefined, 'three']];
    const res = Util.compact(input);
    expect(res).to.eql(['one', 'two', 'three']);
  });
});
