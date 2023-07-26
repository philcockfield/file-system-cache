import { fs, fsPath } from './libs';

export function toAbsolutePath(path: string) {
  return path.startsWith('.') ? fsPath.resolve(path) : path;
}

export function isFileSync(path: string) {
  return fs.existsSync(path) ? fs.lstatSync(path).isFile() : false;
}

export function readFileSync(path: string) {
  return fs.existsSync(path) ? fs.readFileSync(path).toString() : undefined;
}

export async function filePathsP(basePath: string, ns: string): Promise<string[]> {
  if (!(await fs.pathExists(basePath))) return [];
  return (await fs.readdir(basePath))
    .filter(Boolean)
    .filter((name) => (ns ? name.startsWith(ns) : true))
    .filter((name) => (!ns ? !name.includes('-') : true))
    .map((name) => `${basePath}/${name}`);
}
