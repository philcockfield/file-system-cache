import fs from 'fs-extra';
import fsPath from 'path';

const BASE_PATH = './test/samples';
const deleteFolder = () => {
  try {
    fs.emptyDirSync(fsPath.resolve(BASE_PATH));
  } catch (e) {
    if (!e.code === 'ENOTEMPTY') {
      throw e;
    }
  }
};

beforeEach(() => deleteFolder());
afterEach(() => deleteFolder());
