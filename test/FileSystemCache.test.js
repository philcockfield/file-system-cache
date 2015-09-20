import { expect } from "chai";
import fsPath from "path";
import FileSystemCache from "../src/FileSystemCache";
import * as f from "../src/funcs";


describe("FileSystemCache", function() {
  describe("paths", function() {
    it("has a default path of '/.build'", () => {
      const cache = new FileSystemCache();
      expect(cache.basePath).to.equal(fsPath.resolve("./.build"));
    });

    it("resolves the path if the path starts with ('.')", () => {
      const path = "./test/foo"
      const cache = new FileSystemCache({ basePath: path });
      expect(cache.basePath).to.equal(fsPath.resolve(path));
    });

    it("uses the given absolute path", () => {
      const path = "/foo"
      const cache = new FileSystemCache({ basePath: path });
      expect(cache.basePath).to.equal(path);
    });

    it("throws if the basePath is a file", () => {
      let fn = () => {
        new FileSystemCache({ basePath: "./README.md" });
      };
      expect(fn).to.throw();
    });
  });


  describe("ns (namespace)", function() {
    it("has no namespace by default", () => {
      expect(new FileSystemCache().ns).to.equal(undefined);
      expect(new FileSystemCache([]).ns).to.equal(undefined);
      expect(new FileSystemCache([null, undefined]).ns).to.equal(undefined);
    });

    it("creates a namespace hash with a single value", () => {
      const cache = new FileSystemCache({ ns:"foo" });
      expect(cache.ns).to.equal(f.hash("foo"));
    });


    it("creates a namespace hash with several values", () => {
      const cache = new FileSystemCache({ ns:["foo", 123] });
      expect(cache.ns).to.equal(f.hash("foo", 123));
    });
  });
});
