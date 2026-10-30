import { cpSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const source = resolve('l2blitz-web/frontend/dist');
const target = resolve('dist');
if (!existsSync(source)) {
  throw new Error('Missing frontend build output: ' + source);
}
rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });
// Cloudflare Pages Advanced Mode: one Worker routes /api to VPS and all other
// requests to static assets, avoiding root-directory Functions discovery issues.
const worker = resolve('pages-worker/_worker.js');
if (!existsSync(worker)) throw new Error('Missing Pages API Worker');
cpSync(worker, resolve('dist/_worker.js'));
console.log('Cloudflare Pages output ready:', target);
