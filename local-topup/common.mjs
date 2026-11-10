import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host:process.env.LOCAL_TOPUP_DB_HOST || '127.0.0.1', port:Number(process.env.LOCAL_TOPUP_DB_PORT || 3306),
  user:process.env.LOCAL_TOPUP_DB_USER || 'root',
  password:process.env.LOCAL_TOPUP_DB_PASSWORD || '',
  database:process.env.LOCAL_TOPUP_DB_NAME || 'l2jmobiush5',
  connectionLimit:3, waitForConnections:true, queueLimit:8,
  multipleStatements:false, decimalNumbers:false,
  timezone:'Z'
});
export const sha = value => crypto.createHash('sha256').update(value).digest();
export const sessionToken = () => crypto.randomBytes(32).toString('base64url');
export const allowedPacks = new Set([100,300,500,1000,1500]);
export function expirySql(minutes) { return new Date(Date.now()+minutes*60000); }
export function assertLocalMode() {
  if (process.env.LOCAL_TOPUP_ENABLED !== '1') throw Error('Local topup disabled: set LOCAL_TOPUP_ENABLED=1');
}
export function getServerRoot() {
  const candidate=process.env.LOCAL_TOPUP_GAME_ROOT;
  if (candidate) return candidate;
  const fallback = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../Lineage2-H5-Solo');
  if (fs.existsSync(fallback)) return fallback;
  throw Error('LOCAL_TOPUP_GAME_ROOT required');
}
