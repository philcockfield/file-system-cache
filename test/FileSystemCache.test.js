"use strict"
import { expect } from "chai";
import fs from "fs-extra";
import fsPath from "path";
import FileSystemCache from "../src/FileSystemCache";
import * as f from "../src/funcs";

const BASE_PATH = "./test/samples/FileSystemCache";
const ABSOLUTE_BASE_PATH = fsPath.resolve(BASE_PATH);


describe("FileSystemCache", function() {
  const deleteFolder = () => fs.removeSync(ABSOLUTE_BASE_PATH);
  beforeEach(() => deleteFolder());
  afterEach(() => deleteFolder());


  describe("basePath", function() {
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


  describe("path", function() {
    it("throws if no key is provided", () => {
      const cache = new FileSystemCache({ basePath: BASE_PATH });
      expect(() => cache.path()).to.throw();
    });

    it("returns a path with no namespace", () => {
      const key = "foo";
      const cache = new FileSystemCache({ basePath: BASE_PATH });
      const path = `${ ABSOLUTE_BASE_PATH }/${ f.hash(key) }`;
      expect(cache.path(key)).to.equal(path);
    });

    it("returns a path with a namespace", () => {
      const key = "foo";
      const ns = [1, 2];
      const cache = new FileSystemCache({ basePath: BASE_PATH, ns: ns });
      const path = `${ ABSOLUTE_BASE_PATH }/${ f.hash(ns) }-${ f.hash(key) }`;
      expect(cache.path(key)).to.equal(path);
    });

    it("returns a path with a file extension", () => {
      const key = "foo";
      const path = `${ ABSOLUTE_BASE_PATH }/${ f.hash(key) }.styl`;
      let cache;
      cache = new FileSystemCache({ basePath: BASE_PATH, extension: "styl" });
      expect(cache.path(key)).to.equal(path);

      cache = new FileSystemCache({ basePath: BASE_PATH, extension: ".styl" });
      expect(cache.path(key)).to.equal(path);
    });
  });


  describe("ensureBasePath()", function() {
    it("creates the base path", (done) => {
      const cache = new FileSystemCache({ basePath: BASE_PATH });
      expect(fs.existsSync(cache.basePath)).to.equal(false);
      expect(cache.basePathExists).not.to.equal(true);
      cache.ensureBasePath()
      .then(() => {
          expect(cache.basePathExists).to.equal(true);
          expect(fs.existsSync(cache.basePath)).to.equal(true);
          done();
      })
      .catch(err => console.error(err));
    });
  });


  describe("get/set", function() {
    describe("get", function() {
      it("file not exist on the file-system", (done) => {
        const cache = new FileSystemCache({ basePath: BASE_PATH });
        cache.get("foo")
        .then(result => {
            expect(result).to.equal(undefined);
            done();
        })
        .catch(err => console.error(err));
      });

      it("reads a stored values (various types)", (done) => {
        const cache1 = new FileSystemCache({ basePath: BASE_PATH });
        const cache2 = new FileSystemCache({ basePath: BASE_PATH });
        cache1.set("text", "my value");
        cache1.set("number", 123);
        cache1.set("object", { foo: 456 })
        .then(() => {
          cache2.get("text")
          .then(result => expect(result).to.equal("my value"))
          .then(() => {
            cache2.get("number").then(result => expect(result).to.equal(123))
          })
          .then(() => {
            cache2.get("object").then(result => expect(result).to.eql({ foo: 456 }))
          })
          .finally(() => done())
          .catch(err => console.error(err));
        })
      });


      it("reads a stored date", (done) => {
        const cache1 = new FileSystemCache({ basePath: BASE_PATH });
        const cache2 = new FileSystemCache({ basePath: BASE_PATH });
        const now = new Date();
        cache1.set("date", now)
        .then(() => {
          cache2.get("date")
          .then(result => {
              expect(result).to.eql(now);
              done();
          })
          .catch(err => console.error(err));
        })
      });

    });


    describe("set", function() {
      it("saves a string to the file-system", (done) => {
        const cache = new FileSystemCache({ basePath: BASE_PATH });
        const path = cache.path("foo");
        const value = "my value"
        expect(fs.existsSync(path)).to.equal(false);
        cache.set("foo", value)
        .then(result => {
            expect(result.path).to.equal(path);
            expect(f.readFileSync(path)).to.include("my value");
            done();
        })
        .catch(err => console.error(err));
      });

      it("saves an object to the file-system", (done) => {
        const cache = new FileSystemCache({ basePath: BASE_PATH });
        const value = { text:"hello", number: 123 };
        cache.set("foo", value)
        .then(result => {
            const fileText = f.readFileSync(result.path);
            expect(fileText).to.include("hello");
            expect(fileText).to.include("123");
            done();
        })
        .catch(err => console.error(err));
      });
    });
  });

  describe("remove", function() {
    const cache = new FileSystemCache({ basePath: BASE_PATH });
    beforeEach((done) => cache.set("foo", "my-text").then(() => done()));

    it("removes the file from the file-system", (done) => {
      expect(f.isFileSync(cache.path("foo"))).to.equal(true);
      cache.remove("foo")
      .then(() => {
          expect(f.isFileSync(cache.path("foo"))).to.equal(false);
          done();
      })
      .catch(err => console.error(err));
    });

    it("does nothing if the key does not exist", (done) => {
      cache.remove("foobar")
      .then(() => done())
      .catch(err => { throw err });
    });
  });
});
