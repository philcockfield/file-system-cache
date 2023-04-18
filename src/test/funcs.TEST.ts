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
    expect(result).to.equal('0f161cb21daaa15962c1085855fe19dcb9df67e9');
  });

  it('returns a hash of a single value', () => {
    const result = Util.hash('one');
    expect(result).to.equal('443b7f970b6c6af26c392534c0a28ed4ad00a30e');
  });

  it('returns a hash from an array', () => {
    const result1 = Util.hash('one', 'two');
    const result2 = Util.hash(['one', 'two']);
    expect(result1).to.equal('7fc87660c49692a9b11b02cb23cc478771ca3e3f');
    expect(result1).to.equal(result2);
  });
});
