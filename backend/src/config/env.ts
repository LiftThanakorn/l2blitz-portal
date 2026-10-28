import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z.string().default('*'),

  /**
   * DEMO_MODE:
   * - In development: defaults to true so the portal can be previewed without a GameServer.
   * - In production: strictly forced to false unless explicitly overridden, and production rules
   *   prevent ever displaying mock numbers as real data.
   */
  DEMO_MODE: z
    .string()
    .optional()
    .transform((val) => {
      if (process.env.NODE_ENV === 'production') return false;
      if (val === undefined) return true;
      return val.toLowerCase() === 'true';
    }),

  // MySQL / MariaDB (L2J Mobius CT 2.6 High Five Read-Only Connection)
  DB_ENABLED: z
    .string()
    .default('false')
    .transform((val) => val.toLowerCase() === 'true'),
  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string().default('l2blitz_ro'),
  DB_PASSWORD: z.string().default(''),
  DB_GAME_NAME: z.string().default('l2jmobius_h5'),
  DB_LOGIN_NAME: z.string().default('l2jmobius_login'),
  DB_POOL_LIMIT: z.coerce.number().min(1).max(10).default(4), // Kept small for budget VPS

  // GameServer & LoginServer TCP Probe
  GAMESERVER_HOST: z.string().default('127.0.0.1'),
  GAMESERVER_PORT: z.coerce.number().default(7777),
  LOGINSERVER_HOST: z.string().default('127.0.0.1'),
  LOGINSERVER_PORT: z.coerce.number().default(2106),
  TCP_PROBE_TIMEOUT_MS: z.coerce.number().default(1500),

  // Excluded test accounts or custom GM names (comma-separated)
  EXCLUDED_ACCOUNT_NAMES: z
    .string()
    .default('admin,gm,test,test01,dev,l2blitz_admin')
    .transform((s) =>
      s
        .split(',')
        .map((x) => x.trim().toLowerCase())
        .filter(Boolean)
    ),
  EXCLUDED_CHAR_NAMES: z
    .string()
    .default('Admin,GM,TestChar,BlitzGM')
    .transform((s) =>
      s
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
    ),

  // Feature flags for optional rankings (Olympiad Heroes, Castles, TvT)
  ENABLE_OLYMPIAD_HEROES: z
    .string()
    .default('true')
    .transform((v) => v.toLowerCase() === 'true'),
  ENABLE_CASTLE_OWNERSHIP: z
    .string()
    .default('true')
    .transform((v) => v.toLowerCase() === 'true'),
  ENABLE_TVT_RANKINGS: z
    .string()
    .default('false')
    .transform((v) => v.toLowerCase() === 'true'),

  // Olympiad Minimum Matches requirement (defaults to 9 as per Mobius High Five standard)
  OLYMPIAD_MIN_MATCHES: z.coerce.number().min(0).default(9),

  // Server Rates Config (Easy override via .env)
  RATE_EXP: z.coerce.number().default(1000),
  RATE_SP: z.coerce.number().default(1000),
  RATE_ADENA: z.coerce.number().default(50),
  RATE_DROP: z.coerce.number().default(10),
  RATE_SPOIL: z.coerce.number().default(15),
  RATE_QUEST_DROP: z.coerce.number().default(5),
  RATE_RAID_DROP: z.coerce.number().default(1),
  SAFE_ENCHANT: z.coerce.number().default(4),
  MAX_ENCHANT_WEAPON: z.coerce.number().default(16),
  MAX_ENCHANT_ARMOR: z.coerce.number().default(12),
  MAX_ENCHANT_JEWELRY: z.coerce.number().default(12),
});

export const env = EnvSchema.parse(process.env);
