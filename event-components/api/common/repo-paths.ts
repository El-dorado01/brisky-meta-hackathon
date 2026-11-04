// New standalone packaging glue; does not copy the pre-existing engine locator.
import * as path from 'node:path';
import * as fs from 'node:fs';
export function resolveFromRepo(value:string):string{
  const root=process.cwd();
  if(!fs.existsSync(path.join(root,'apps/demo/server.cjs')))throw new Error('Start this runner from its repository root.');
  return path.resolve(root,value);
}
