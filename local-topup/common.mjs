import crypto from 'node:crypto';
import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host:'127.0.0.1', port:3306,
  user:process.env.LOCAL_TOPUP_DB_USER || 'root',
  password:process.env.LOCAL_TOPUP_DB_PASSWORD || '',
  database:process.env.LOCAL_TOPUP_DB_NAME || 'l2jmobiush5',
  connectionLimit:3, waitForConnections:true, queueLimit:8,
  multipleStatements:false, decimalNumbers:false
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
  if (!candidate) throw Error('LOCAL_TOPUP_GAME_ROOT required');
  return candidate;
}
