import { cpSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const source = resolve('l2blitz-web/frontend/dist');
const target = resolve('dist');
if (!existsSync(source)) {
  throw new Error('Missing frontend build output: ' + source);
}
rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });
console.log('Cloudflare Pages output ready:', target);
