"use strict";
import { expect } from "chai";
import util from "../src/util";


describe("util", function() {
  it("does not hash nothing", () => {
    expect(util.hash()).to.equal(undefined);
    expect(util.hash(null)).to.equal(undefined);
    expect(util.hash(null, undefined)).to.equal(undefined);
    expect(util.hash(null, [undefined, null])).to.equal(undefined);
  });

  it("returns a hash of multiple values", () => {
    const result = util.hash("one", undefined, [3,4], 2);
    expect(result).to.equal("8c419f18180f081f669c2f765ecd6256");
  });

  it("returns a hash of a single value", () => {
    const result = util.hash("one");
    expect(result).to.equal("a2a665650cd1ed2317f27a10233f2712");
  });

  it("returns a hash from an array", () => {
    const result1 = util.hash("one", "two");
    const result2 = util.hash(["one", "two"]);
    expect(result1).to.equal("a56d47fc98270e77595d2e39af030886");
    expect(result1).to.equal(result2);
  });
});
