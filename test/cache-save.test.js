"use strict"
import { expect } from "chai";
import fs from "fs-extra";
import fsPath from "path";
import FileSystemCache from "../src/cache";
import * as f from "../src/funcs";

const BASE_PATH = "./test/samples/FileSystemCache";
const ABSOLUTE_BASE_PATH = fsPath.resolve(BASE_PATH);


describe("save", function() {
  it("throws if items not valie", () => {
    const cache = new FileSystemCache({ basePath: BASE_PATH });
    expect(() => cache.save([1])).to.throw();
  });


  it.skip("saves several files", (done) => {
    const cache = new FileSystemCache({ basePath: BASE_PATH });
    const payload = [
      { key: "one", value: "value-1" },
      null, // Should not break with null values.
      { key: "two", value: "value-2" }
    ]

    cache.save(payload)
    .then(result => {
        console.log("result", result);
        done();
    })
    .catch(err => console.error(err));
  });
});
