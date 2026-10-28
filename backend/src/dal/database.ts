import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

let gamePool: mysql.Pool | null = null;

/**
 * Returns a strictly Read-Only connection pool for L2J Mobius CT 2.6 High Five.
 * Connection pool limit is capped (default 4) to preserve RAM on a shared budget VPS.
 */
export function getGameDbPool(): mysql.Pool | null {
  if (!env.DB_ENABLED) {
    return null;
  }

  if (!gamePool) {
    gamePool = mysql.createPool({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_GAME_NAME,
      waitForConnections: true,
      connectionLimit: env.DB_POOL_LIMIT,
      queueLimit: 15,
      connectTimeout: 3000,
      decimalNumbers: true,
      // Security: Never allow multi-statement execution
      multipleStatements: false,
    });
  }

  return gamePool;
}

/**
 * Pings the MySQL Game Database to verify connectivity.
 * Note: Database Online does NOT imply GameServer Online!
 */
export async function pingDatabase(): Promise<boolean> {
  const pool = getGameDbPool();
  if (!pool) return false;

  let conn: mysql.PoolConnection | null = null;
  try {
    conn = await pool.getConnection();
    await conn.ping();
    return true;
  } catch {
    return false;
  } finally {
    if (conn) conn.release();
  }
}

/**
 * Executes a strictly read-only SELECT query with parameterized inputs.
 * Rejects any query string that does not start with SELECT.
 */
export async function executeReadOnlyQuery<T>(
  sql: string,
  params: Array<string | number | boolean | null> = []
): Promise<T[]> {
  const trimmed = sql.trim();
  if (!/^SELECT\b/i.test(trimmed)) {
    throw new Error('Security Violation: Only SELECT queries are permitted by the L2Blitz Data Access Layer.');
  }

  const pool = getGameDbPool();
  if (!pool) {
    throw new Error('Database connection is disabled (DB_ENABLED=false).');
  }

  const [rows] = await pool.execute(trimmed, params);
  return rows as T[];
}
