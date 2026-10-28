import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { DataSourceMode } from '../types/api.js';

dotenv.config();

/**
 * Read-Only MySQL Connection Pool & In-Memory TTL Cache for L2J Mobius CT 2.6 High Five
 *
 * SECURITY & ARCHITECTURE GUARANTEES:
 * - Never exposes DB credentials in logs or API responses.
 * - Enforces strict read-only SELECT execution.
 * - Uses in-memory TTL caching (15s–60s) to protect the L2J Mobius MariaDB/MySQL server
 *   running on a budget 500 THB/month VPS without requiring Redis.
 */

let pool: mysql.Pool | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(
    process.env.DB_HOST &&
      process.env.DB_USER &&
      process.env.DB_NAME &&
      process.env.DB_ENABLE === 'true'
  );
}

// Sample player/clan data is restricted to unit tests. Never serve demo data.
export function isDevFixtureEnabled(): boolean {
  return false;
}

export function getActiveDataSourceMode(): DataSourceMode {
  if (isDatabaseConfigured()) return 'live_mysql';
  if (isDevFixtureEnabled()) return 'dev_fixture';
  return 'unavailable';
}

export function getDbPool(): mysql.Pool | null {
  if (!isDatabaseConfigured()) {
    return null;
  }
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 15,
      connectTimeout: 4000,
    });
  }
  return pool;
}

/**
 * Executes a strictly read-only SQL query against the L2J Mobius High Five database.
 */
export async function executeReadOnlyQuery<T = unknown>(
  sql: string,
  params: (string | number)[] = []
): Promise<T[] | null> {
  const trimmed = sql.trim().toUpperCase();
  if (!trimmed.startsWith('SELECT')) {
    throw new Error('Security policy violation: Only read-only SELECT queries are permitted.');
  }

  const activePool = getDbPool();
  if (!activePool) {
    return null;
  }

  try {
    const [rows] = await activePool.execute(sql, params);
    return rows as T[];
  } catch (err) {
    console.error('[L2Blitz DB Adapter] Read-only query failed (safe fallback triggered)');
    return null;
  }
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

export async function withTtlCache<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const cached = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }
  const fresh = await fetcher();
  memoryCache.set(key, {
    value: fresh,
    expiresAt: now + ttlMs,
  });
  return fresh;
}

export function clearMemoryCache(): void {
  memoryCache.clear();
}
