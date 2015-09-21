import { expect } from "chai";
import CacheFs from "../src";
import FileSystemCache from "../src/FileSystemCache";

const BASE_PATH = "./test/samples/main";


describe("Main API", function() {
  it("creates an instance of [FileSystemCache]", () => {
    const cache = CacheFs({ basePath: BASE_PATH });
    expect(cache).to.be.an.instanceof(FileSystemCache);
  });
});
