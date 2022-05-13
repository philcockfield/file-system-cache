import { expect, Util } from './common';

describe('util.hash', function () {
  it("does not hash 'nothing' (undefined)", () => {
    expect(Util.hash()).to.equal(undefined);
    expect(Util.hash(null)).to.equal(undefined);
    expect(Util.hash(null, undefined)).to.equal(undefined);
    expect(Util.hash(null, [undefined, null])).to.equal(undefined);
  });

  it('returns a hash of multiple values', () => {
    const result = Util.hash('one', undefined, [3, 4], 2);
    expect(result).to.equal('8c419f18180f081f669c2f765ecd6256');
  });

  it('returns a hash of a single value', () => {
    const result = Util.hash('one');
    expect(result).to.equal('a2a665650cd1ed2317f27a10233f2712');
  });

  it('returns a hash from an array', () => {
    const result1 = Util.hash('one', 'two');
    const result2 = Util.hash(['one', 'two']);
    expect(result1).to.equal('a56d47fc98270e77595d2e39af030886');
    expect(result1).to.equal(result2);
  });
});
